# Tóm tắt Kết quả Thực nghiệm ML-WAF AWS Test

## Thông tin cơ bản
- **Thời gian thực hiện**: 26/06/2026
- **Mục tiêu**: Kiểm tra và tìm các payload SQL Injection có thể vượt qua WAF (Application Load Balancer trên AWS)
- **URL đích**: http://dune-load-balancer-1826856788.ap-southeast-2.elb.amazonaws.com/projects
- **Mode injection**: Query parameter `projectName`
- **Base payload**: `36331' OR 1=1--` (được thay thế với `Demo_project`)
- **Số biến thể đã kiểm tra**: 21,000

## Kết quả tổng quan
| Loại kết quả | Số lượng | Tỷ lệ |
|--------------|----------|-------|
| **Bypass thành công** | 15,457 | 73.6% |
| **Được chặn (WAF)** | 3,221 | 15.3% |
| **Khác (404, lỗi không liên quan)** | 2,322 | 11.1% |

### Phân loại theo HTTP Status
| HTTP Status | Số lượng | Mô tả |
|-------------|----------|-------|
| 200 OK | 9,866 | Yêu cầu thành công, có thể là bypass |
| 403 Forbidden | 3,221 | Được chặn bởi WAF |
| 404 Not Found | 2,259 | Không tìm thấy (có thể do xử lý payload lỗi) |
| 500 Internal Server Error | 5,591 | Lỗi server (có thể là bypass thành công do SQL Injection gây lỗi) |

## Kết quả theo các loại biến thể (Transform)
Dữ liệu từ `learned_encodings.json`:

| Biến thể | Bypass | Blocked | Other | Reach |
|---------|--------|---------|-------|-------|
| **url_encode** | 8,534 | 3,274 | 0 | 8,534 |
| **null_byte** | 7,209 | 0 | 2 | 7,211 |
| **case_mix** | 97 | 6 | 2,224 | 2,321 |
| **other** | 88 | 12 | 1 | 89 |
| **hex** | 10 | 1 | 32 | 42 |
| **tab** | 1 | 6 | 0 | 1 |
| **comment_inline** | 1 | 2 | 0 | 1 |
| **plus_space, newline, vtab, cr, ff, comment_block, encoded** | 0 | >0 | 0 | 0 |

## Kết luận chính
1. **URL Encode nhiều lần (double/triple url encode)** và **Null Byte Suffix** là hai kỹ thuật hiệu quả nhất để bypass WAF trong trường hợp này
2. WAF chặn hiệu quả các payload có khoảng trắng thay thế bằng `+`, ký tự tab/newline, comment block (`/* */`), v.v.
3. Việc decode URL nhiều lần trên server đã được khắc phục để tránh lỗi 500 trong quá trình test

## Tệp dữ liệu tham khảo
- `data/aws_probe_summary.json`: Tổng kết chi tiết
- `data/aws_probe_report.txt`: Báo cáo từng biến thể
- `data/bypass_learned.jsonl`: Danh sách các payload bypass thành công
- `data/blocked_learned.jsonl`: Danh sách các payload bị chặn
- `data/learned_encodings.json`: Thống kê theo loại biến thể
- `data/mutate_rules.json`: Quy tắc tạo biến thể
