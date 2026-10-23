# KẾ HOẠCH THỰC NGHIỆM TOÀN DIỆN
## Đánh giá Tấn công Đối kháng và Tăng cường Phòng thủ Tường lửa AWS WAF (Adversarial ML-WAF Test)

> **Tài liệu**: Kế hoạch Thí nghiệm Chi tiết (Comprehensive Experiment Specification & Protocol)  
> **Dự án**: Nghiên cứu Tấn công Đối kháng (Evasion Mutation) & Tăng cường Phòng thủ (Rule Synthesis & ML WAF)  
> **Bài báo liên kết**: *Systematic Mutation and Black-Box Probing for SQL Injection WAF Bypass: A Live Testbed and Family-Level Analysis* (HUST - SoICT)  
> **Module thực thi**: `ml-waf-aws-test`  
> **Phiên bản tài liệu**: 2.0 (Master Review Edition)  

---

## 1. THÔNG TIN HỆ THỐNG VÀ KIẾN TRÚC MỤC TIÊU

- **Kiến trúc hệ thống**:
  - **Tầng biên (Edge / Security Layer)**: AWS Application Load Balancer (ALB) tích hợp AWS WAFv2 WebACL.
  - **Tầng ứng dụng (Application Layer)**: Backend REST API viết bằng NestJS (Node.js/TypeScript), tiếp nhận và giải mã truy vấn từ router HTTP.
  - **Tầng cơ sở dữ liệu (Database Layer)**: PostgreSQL Database (Neon Serverless DB), thực thi các câu lệnh truy vấn SQL động.
- **Target Endpoint**: `http://dune-load-balancer-1826856788.ap-southeast-2.elb.amazonaws.com/projects`
- **Vị trí tiêm (Injection Slot)**: HTTP GET Query Parameter `projectName` (`/projects?projectName=<payload>`).
- **Base Payload Seed**: `36331' OR 1=1--` (được re-map chuỗi nhận dạng thành `Demo_project' OR 1=1--` để đảm bảo ngữ cảnh hợp lệ phía backend).
- **SQL Dialect**: PostgreSQL.
- **Công cụ điều phối & phân tích**: `run_probe.py`, `pg_variants.py`, `adv_mutate.py`, `analyze_status_codes.py`, `paper-defense-rfc-ml/ml_baseline.py`.

---

## 2. MỤC TIÊU THỰC NGHIỆM & CÂU HỎI NGHIÊN CỨU (RESEARCH QUESTIONS)

### 2.1. Mục tiêu tổng quát
Xây dựng quy trình đánh giá đối kháng khép kín (**Closed-Loop Red-Blue Teaming**):
1. **Đo lường khách quan** mức độ chống chịu của AWS WAF trước các kỹ thuật đột biến ngữ nghĩa SQL Injection.
2. **Xác định nguyên nhân gốc rễ (Root Cause)** của hiện tượng bypass: sự bất đồng bộ trong chuỗi chuẩn hóa dữ liệu (**Parser/Decoder Impedance Mismatch**) giữa WAF và Backend.
3. **Đề xuất và kiểm chứng giải pháp phòng thủ**: Tùy biến quy tắc (Custom Rule) và mô hình học máy (ML Surrogate), đo lường mức độ giảm thiểu bypass và kiểm tra tính an toàn không chặn nhầm (False Positive).

### 2.2. Các câu hỏi nghiên cứu cụ thể
- **RQ1 (Quy mô & Tổng thể - Scale & Semantics)**: Tỉ lệ bypass tổng thể ($BR_{agg}$) của AWS WAF mặc định là bao nhiêu khi đối mặt với hàng chục nghìn biến thể?
- **RQ2 (Cấu trúc phân hóa - Family Heterogeneity)**: Tỉ lệ bypass phân bố thế nào giữa các họ kỹ thuật biến đổi (Encoding, Null Byte, Case Mixing, Hex Injection, Whitespace substitution)?
- **RQ3 (Gia cố phòng thủ - Custom Rule Hardening)**: Khi tích hợp Custom Rule `Advanced-Hex-SQLi-Bypass-Protection`, tỉ lệ bypass của các họ nguy cơ cao giảm bao nhiêu?
- **RQ4 (An toàn nghiệp vụ - False Positive Validation)**: Rule tùy biến mới có làm gián đoạn lưu lượng người dùng hợp lệ không? Tỉ lệ chặn nhầm (FPR) là bao nhiêu?
- **RQ5 (Giới hạn chuẩn hóa & Mô hình ML - Surrogate Defense Control)**: Chuẩn hóa đệ quy RFC (fixpoint decoding) có giúp mô hình học máy phân loại tốt hơn các biến thể bị làm mờ hay không?

---

## 3. QUY CHUẨN PHÂN LOẠI PHẢN HỒI (OUTCOME SEMANTICS & GROUND TRUTH)

Mỗi phản hồi HTTP từ server được phân loại tự động theo chuẩn logic nghiên cứu:

| Phân loại | Mã HTTP & Dấu hiệu nhận biết | Ý nghĩa an toàn thông tin |
| :--- | :--- | :--- |
| **`blocked`** | **`403 Forbidden`** (từ ALB/WAF) | **Phòng thủ thành công**: WAF nhận diện đúng chữ ký/luật và ngăn chặn tại tầng biên. |
| **`bypass`** | **`200 OK`** (trả danh sách project)<br>**`500 Internal Server Error`** (lỗi SQL/Database exception)<br>**`400 / 422`** (Validation error từ ứng dụng) | **Vượt rào thành công (Downstream Impact)**: Payload đã qua mặt WAF, tiến vào framework backend và chạm tới Database PostgreSQL. |
| **`other`** | **`404 Not Found`** (sai định tuyến URL)<br>**`500 Ineffective`** (lỗi decode ký tự UTF-8 tại web server) | **Nhiễu / Biến dạng không hợp lệ**: Payload bị hỏng cấu trúc URL trước khi tới được logic nghiệp vụ. |

---

## 4. CHI TIẾT CÁC KỊCH BẢN THỰC NGHIỆM (SCENARIO MATRIX)

Hệ thống thực nghiệm được chia thành **5 kịch bản độc lập nhưng gắn kết chặt chẽ**:

```
                       ┌───────────────────────────────────────────────┐
                       │     BỘ ĐỘT BIẾN ĐỐI KHÁNG (MUTATION ENGINE)   │
                       └───────┬───────────────────────────────┬───────┘
                               │                               │
                 [Kịch bản 1: Baseline]             [Kịch bản 2: Single-Layer]
                 (Payload thô kinh điển)            (Kiểm tra từng phép biến đổi)
                               │                               │
                               └───────────────┬───────────────┘
                                               ▼
                             [Kịch bản 3: Multi-Layer Generative]
                             (Tiến hóa đa thế hệ Gen 0 -> Gen 5)
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
 [Kịch bản 4: Tăng cường Phòng thủ]                               [Kịch bản 5: ML & Chuẩn hóa RFC]
  - S4A: Bật Custom Rule (Hex/Null-byte)                           - Mở rộng tập huấn luyện (n >= 1,000)
  - S4B: Đo False Positive (Benign Traffic)                        - Đo Precision/Recall/F1 trước & sau decode
```

---

### Kịch bản 1 (S1): Kiểm thử Cơ sở (Baseline Probe)
- **Mục tiêu**: Xác nhận WAF đang hoạt động chuẩn và có khả năng chặn các mẫu tấn công sách giáo khoa (textbook SQLi).
- **Tập payload**: Các mẫu thô không mã hóa:
  - `Demo_project' OR 1=1--`
  - `Demo_project' UNION SELECT 1,2--`
  - `Demo_project' AND '1'='1`
- **Chính sách WAF**: AWS Default Managed Rules (`AWSManagedRulesSQLiRuleSet`).
- **Quy mô**: 50 – 100 requests.
- **Giá trị khoa học (Value)**: Đảm bảo tính hợp lệ của môi trường thử nghiệm (WAF không bị tắt hoặc bypass do cấu hình sai mạng).

---

### Kịch bản 2 (S2): Đột biến Đơn tầng (Single-Layer Operator Stress Test)
- **Mục tiêu**: Đo lường độ nhạy và xác định điểm yếu của WAF đối với từng toán tử biến đổi riêng lẻ.
- **Các nhóm toán tử kiểm thử**:
  1. **Mã hóa URL đơn (Single URL Encode)**: `%27`, `%20`, `%2d%2d`.
  2. **Ký tự Null Byte đơn**: Chèn `%00` hoặc `\x00` ở cuối payload (`...--%00`).
  3. **Xáo trộn hoa-thường (Case Mixing)**: `oR`, `sElEcT`, `uNiOn`.
  4. **Thay thế khoảng trắng (Whitespace Substitution)**: Dấu cộng `+`, Tab `%09`, Line Feed `%0a`, Comment inline `/**/`.
  5. **Mã hóa chuỗi Hex / Dialect Char**: `0x...`, `CHR(49)||CHR(50)`.
- **Quy mô**: Khoảng 200 – 500 requests.
- **Giá trị khoa học (Value)**: Cung cấp số liệu phân rã chi tiết (operator-level analysis) để biết toán tử nào bị WAF chặn ngay từ đầu, toán tử nào bắt đầu có dấu hiệu lọt.

---

### Kịch bản 3 (S3): Đột biến Tiến hóa Đa tầng (Multi-Layer Generative Probe)
- **Mục tiêu**: Mô phỏng kẻ tấn công nâng cao (Advanced Red Team) kết hợp nhiều kỹ thuật mã hóa lồng nhau qua nhiều thế hệ để khai thác điểm mù giải mã.
- **Cơ chế thế hệ (Generations)**:
  - **Gen 0**: Tập biến thể ban đầu từ PostgreSQL dialect (`pg_variants.py`).
  - **Gen 1 $\to$ Gen 5**: Lấy các payload bypass thành công ở thế hệ trước, đưa vào hàng đợi và tiếp tục áp dụng các lớp đột biến tiếp theo từ `mutate_rules.json`:
    - Double URL Encoding: `%2527`, `%2520`.
    - Triple URL Encoding: `%252527`.
    - Kết hợp Hex Prefix + Null Byte: `projectx...%00`.
    - Kết hợp Case Mixing + Inline Comment: `/*foo*/oR/*bar*/1=1`.
- **Quy mô**: $15,000 - 25,000$ HTTP requests (`--full --fresh`).
- **Giá trị khoa học (Value)**:
  - Chỉ ra **sự bất đồng bộ giải mã (Parser Differential)**: AWS WAF giải mã 1 lần (`URL_DECODE` đơn), trong khi tầng Application/Router phía sau giải mã tiếp lần 2.
  - Cung cấp toàn bộ số liệu thống kê cho **RQ1, RQ2, Table I và Table II** của bài báo.

---

### Kịch bản 4: Tăng cường Phòng thủ & Đánh giá Đối chứng (Defense Hardening & Verification)

Kịch bản này được chia làm 2 pha kiểm chứng thực tế:

#### Kịch bản 4A (S4A): Đánh giá Hiệu quả của Custom Rule
- **Thực hiện**:
  1. Thêm Custom Rule mới vào AWS WAF WebACL:
     - **Tên**: `Advanced-Hex-SQLi-Bypass-Protection` (Priority 17).
     - **Nội dung**: Bắt chuỗi Hex dài $\ge 8$ bytes kèm `%00` / `\x00`, bắt tiền tố `projectx[0-9a-f]{10,}`, và bắt ký tự Null-byte ở cuối chuỗi sau 2 bước biến đổi `URL_DECODE` $\to$ `LOWERCASE`.
  2. Bắn lại các biến thể thuộc họ Null-byte và Hex từng bypass thành công ở Kịch bản 3.
- **Giá trị khoa học (Value)**:
  - Chứng minh giải pháp cụ thể: Biến bài báo từ "chỉ trích điểm yếu" thành "đưa ra giải pháp khắc phục có đo lường".
  - Tạo ra chỉ số $\Delta BR_f$ chứng minh rule custom triệt tiêu hoàn toàn 2 họ bypass lớn nhất.

#### Kịch bản 4B (S4B): Kiểm tra Tính An toàn & Tỉ lệ Chặn nhầm (False Positive Validation)
- **Thực hiện**:
  - Tạo tập kiểm thử 500 truy vấn hợp lệ (Benign Dataset):
    - Tên dự án thông thường tiếng Anh / tiếng Việt.
    - Chuỗi mã băm Git Commit SHA (chuỗi 40 ký tự hex hoàn toàn bình thường trong phần mềm quản lý source code).
    - Chuỗi định danh UUID (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
    - Tên chứa ký tự hợp lệ thông dụng (`-`, `_`, `.`, khoảng trắng).
  - Gửi qua endpoint có bật Custom Rule và ghi nhận số lượng request bị chặn nhầm.
- **Giá trị khoa học (Value)**:
  - Bẻ gãy nghi vấn kinh điển của mọi Reviewer: *"Rule regex của anh viết chặt thế liệu có chặn nhầm người dùng bình thường không?"*.
  - Chứng minh $FPR = 0\%$, khẳng định giải pháp có khả năng áp dụng thực tế trong sản xuất.

---

### Kịch bản 5 (S5): Giới hạn Chuẩn hóa RFC & Đánh giá Mô hình Học máy (ML Surrogate Control)
- **Mục tiêu**: Kiểm chứng câu hỏi nghiên cứu **RQ5**: *"Liệu việc chuẩn hóa đệ quy đơn thuần (RFC recursive decoding) có đủ để ngăn chặn bypass không, và mô hình Machine Learning có ưu thế gì?"*.
- **Thực hiện**:
  1. Trích xuất dataset cân bằng $\ge 1,000$ mẫu (gồm balanced bypass và blocked) từ log của Kịch bản 3.
  2. Chuẩn hóa chuỗi bằng thuật toán RFC Fixpoint (`rfc_canonicalize.py` - giải mã liên tục cho đến khi chuỗi không còn đổi).
  3. Huấn luyện và đánh giá mô hình Random Forest ở 2 trạng thái: (1) Chuỗi thô (Raw) và (2) Chuỗi đã chuẩn hóa (Canonicalized).
  4. Đo lường đầy đủ: Precision, Recall, F1-Score, AUC-ROC thay vì chỉ dựa vào Accuracy.
- **Giá trị khoa học (Value)**:
  - **Khắc phục triệt để điểm yếu của bài báo cũ**: Thay thế Bảng III ($n=20$ mẫu đồ chơi) bằng kết quả thực nghiệm học máy quy mô lớn có ý nghĩa thống kê cao.
  - Chứng minh rằng chuẩn hóa chuỗi đơn thuần không thể loại bỏ hết các đặc trưng đối kháng $\to$ Khẳng định tầm quan trọng của việc kết hợp AI/ML WAF.

---

## 5. BẢNG MA TRẬN KẾT QUẢ KỲ VỌNG (EXPECTED RESULTS MATRIX)

| Chỉ số / Họ Biến thể | Kịch bản 1 (Baseline) | Kịch bản 2 & 3 (AWS WAF Gốc) | Kịch bản 4A (AWS + Custom Rule) | Kịch bản 4B (Benign Validation) | Kịch bản 5 (ML Model) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`spawn_null_byte`** | Bị chặn ($0\%$) | **$85\% - 92\%$** *(Điểm mù)* | **$\approx 0\%$** *(Đã khắc phục)* | Không áp dụng | $F_1 \ge 0.88$ |
| **`hex_account_style`** | Bị chặn ($0\%$) | **$90\% - 100\%$** *(Điểm mù)* | **$\approx 0\%$** *(Đã khắc phục)* | Không áp dụng | $F_1 \ge 0.90$ |
| **`spawn_encoding` (Double URL)** | Bị chặn ($0\%$) | **$2\% - 15\%$** *(Một phần)* | $2\% - 15\%$ *(Giữ nguyên)* | Không áp dụng | $F_1 \ge 0.85$ |
| **`spawn_case_mix`** | Bị chặn ($0\%$) | **$85\% - 90\%$** *(Tồn tại)* | $85\% - 90\%$ *(Tồn tại)* | Không áp dụng | $F_1 \ge 0.82$ |
| **Tổng thể ($BR_{agg}$)** | **$0\%$** | **$35\% - 45\%$** | **$10\% - 18\%$** | Không áp dụng | — |
| **False Positive Rate (FPR)** | Không áp dụng | Không áp dụng | Không áp dụng | **$0.0\%$** *(An toàn)* | $FPR \le 2\%$ |

---

## 6. HƯỚNG DẪN CÂU LỆNH THỰC THI (EXECUTION COMMANDS)

### Bước 1: Chạy Kịch bản 1, 2, 3 (Thu thập dữ liệu tấn công & đánh giá gốc)
```powershell
cd ml-waf-aws-test

# Chạy phiên thăm dò toàn diện qua 5 thế hệ (Lưu vào data/aws_probe_results.jsonl)
python run_probe.py --full --fresh

# Phân tích kết quả theo từng loại status code và transform
python analyze_status_codes.py

# Xuất bảng phân rã họ biến thể (Table I & Table II cho bài báo)
python paper-attack-evasion/run_mutation_report.py
```

### Bước 2: Chạy Kịch bản 4 (Gia cố Rule & Kiểm tra False Positive)
```powershell
# Sau khi add Rule Priority 17 trên AWS Console, tiến hành test kiểm chứng đối kháng
python run_probe.py --config config_hardened.json --fresh

# Chạy kiểm thử lưu lượng hợp lệ (Benign) đo False Positive
python test_false_positive.py --target-url "http://dune-load-balancer-1826856788.ap-southeast-2.elb.amazonaws.com/projects"
```

### Bước 3: Chạy Kịch bản 5 (ML Baseline & Chuẩn hóa RFC)
```powershell
# Đánh giá mô hình học máy trên tập dữ liệu mở rộng (Cập nhật Table III)
python paper-defense-rfc-ml/run_defense_eval.py --samples 1000
```

---

## 7. TẬP TIN LƯU TRỮ VÀ ARTIFACTS ĐẦU RA

- `data/aws_probe_results.jsonl`: Bản ghi chi tiết toàn bộ các lượt thử nghiệm (URL, Payload, Status Code, Label).
- `data/bypass_learned.jsonl`: Danh sách toàn bộ các payload vượt qua WAF thành công.
- `data/blocked_learned.jsonl`: Danh sách toàn bộ các payload bị chặn.
- `data/status_code_analysis_report.txt`: Bảng thống kê chi tiết mã trạng thái phục vụ làm biểu đồ trong bài báo.
- `data/generated_aws_rule_suggestion.json`: Bộ gợi ý rule tự động sinh từ dữ liệu bypass.
- `paper-attack-evasion/exports/`: Thư mục chứa các file LaTeX/CSV được tạo tự động để nạp trực tiếp vào mã nguồn bài báo.
