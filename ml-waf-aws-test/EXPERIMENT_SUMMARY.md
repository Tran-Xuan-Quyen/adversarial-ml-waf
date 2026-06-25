# Tóm tắt thực nghiệm AWS WAF / SQLi probe

## 1. Mục tiêu

- Đánh giá cách hệ thống WAF / ứng dụng phản ứng với các payload SQL injection variant.
- Tìm các payload gây bypass, các payload bị chặn bởi WAF, và các trường hợp không rõ ràng (other).
- Thu thập dữ liệu để phân tích các biến thể payload và các encoding/transform pattern.

## 2. Thiết lập thực nghiệm

- Target: URL cấu hình trong [ml-waf-aws-test/config.json](ml-waf-aws-test/config.json)
- Payload seed ban đầu: `36331' OR 1=1--`
- Dialect: PostgreSQL
- Inject mode: query parameter `projectName`
- Bước sinh biến thể:
  - variants cho dialect cụ thể
  - AWS extra variants
  - adv mutation variants
  - deduplication và giới hạn per transform type
- Thời gian chờ giữa request: 0.15s

## 3. Quy trình thực hiện

1. Tạo danh sách payload variant từ seed ban đầu.
2. Áp dụng remap ID nếu cần.
3. Sinh thêm biến thể theo các pattern AWS/encoding/mutation.
4. Gửi probe tới target và ghi kết quả vào [ml-waf-aws-test/data/aws_probe_results.jsonl](ml-waf-aws-test/data/aws_probe_results.jsonl).
5. Phân loại mỗi request thành:
   - `blocked`: bị chặn bởi WAF/edge-style denial
   - `bypass`: có phản hồi hiệu quả như 200/500/400/422
   - `other`: 404/not_found, timeout, error, hoặc kết quả không rõ
6. Ghi dữ liệu học được vào các file:
   - [ml-waf-aws-test/data/bypass_learned.jsonl](ml-waf-aws-test/data/bypass_learned.jsonl)
   - [ml-waf-aws-test/data/blocked_learned.jsonl](ml-waf-aws-test/data/blocked_learned.jsonl)
   - [ml-waf-aws-test/data/other_learned.jsonl](ml-waf-aws-test/data/other_learned.jsonl)

## 4. Kết quả đạt được với 10k request

Dựa trên [ml-waf-aws-test/data/aws_probe_summary.json](ml-waf-aws-test/data/aws_probe_summary.json):

| Metric          | Giá trị |
| --------------- | ------: |
| Variants tested |  10,000 |
| Bypass          |   8,221 |
| Blocked         |   1,687 |
| Other / error   |      92 |
| WAF passed      |   8,313 |

### Phân bố HTTP status

- 200: 968
- 403: 1,687
- 404: 92
- 500: 7,253

## 5. Ý nghĩa kết quả

- Hệ thống có một tỷ lệ bypass rất cao đối với các variant payload được sinh ra.
- WAF/edge block phần lớn các payload gốc và một số biến thể đơn giản, nhưng nhiều biến thể encoded/mutated vẫn vượt qua.
- Các payload bị chặn và payload bypass không có overlap theo dữ liệu learned hiện tại:
  - blocked ∩ bypass = 0
  - blocked ∩ other = 0
  - bypass ∩ other = 0

## 6. Dữ liệu học được

- Distinct payloads trong các file learned hiện tại:
  - bypass: 8,362
  - blocked: 1,716
  - other: 92

## 7. Kết luận ngắn

Thực nghiệm với 10k request cho thấy pipeline sinh variant và probe hoạt động hiệu quả trong việc phát hiện nhiều payload có khả năng bypass WAF, đồng thời thu được một tập dữ liệu lớn cho các phân tích tiếp theo.
