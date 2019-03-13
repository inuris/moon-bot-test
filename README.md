## Facebook Messenger Bot Chat for Moon
[Moon Báo Giá](https://m.me/moonbaogia)
 
## Cấu trúc object Website
**WEBSITENAME**: {
 - [x] **TAX** : 0.083, `// Thuế Mỹ của web`
 - [x] **MATCH** : "domain.com", `// Match domain thì sẽ bắt đầu process`
 - [ ] **NAME** : "WebName", `// [optional] Tên hiển thị khi gọi getAvailableWebsite`
 - [x] **SILENCE** : true, `// Nếu có SILENCE == true thì khi không lấy được giá sẽ im lặng không trả lời (dành cho web có check captcha)`

> **Option khác**
 - [ ] **RATE** : "EUR", `// [optional] Quy đổi ngoại tệ. Default ko có thì sẽ là USD`
 - [ ] **COOKIE** : "session-id=12345", `// [optional] Dùng khi web cần cookie để lưu region`

> **Lấy thông tin Price**
> Case 1: Lấy priceBlock trong source bằng selector
 - [x] **PRICEBLOCK** : ["#priceBlock"], `// Array chứa id/class các block chứa Giá`

> Case 2: Nếu ko có priceBlock thì sẽ xét tới json để lấy giá
 - [ ] **JSONBLOCK** : {
	- **SELECTOR** : "#scriptBlock", `// [optional] Case 1: Nếu json được lưu ở block có id thì có thể dùng Selector`
	- **INDEX** : 0, `// Case 2: Nếu json lưu ở vị trí index cố định thì sẽ lấy ra index đó`
	- **KEYWORD** : "masterData", `// [optional] Case 3: Nếu json ko có vị trí cố định thì sẽ dò theo keyword xuyên suốt các block`
	- **REGEX** : /\{[.+\}/gm, `// Nếu trong script là 1 đoạn code js rồi mới có JSON thì dùng regex để lấy phần json ra`
	- **PATH** : ["$.price"] `// Lấy ra element theo format của jsonpath`
}

> Lấy thông tin Category & Weight: 
> Case 1: Category & Weight nằm chung block
 - [ ] **DETAILBLOCK** : ["#detailBlock"], `// [optional] Case 1: Array chứa id/class các block chứa Detail Weight & Category (hiện chỉ có Amazon)`
> Case 2: Category & Weight nằm riêng block
 - [ ] **CATEGORYBLOCK** : ["#categoryBlock"], `// [optional] Array chứa id/class các block chứa Category`

 - [ ] **WEIGHTBLOCK** : ["#weightBlock"], `// [optional] Array chứa id/class các block chứa Weight`
 - [ ] **REDIRECT** : ["#redirectLink"] `// [optional] Array chứa id/class các block chứa link để redirect sang 3rd party (hiện chỉ có Amazon)`
}

## Cấu trúc object Category

**GENERAL**: {
 - [x] **ID** : "GENERAL", `// Id của category`
 - [x] **SHIP** : 8.5, `// Giá ship về VN tính theo $/kg`

> **Phụ thu theo cái**
> VD: giá từ 0-$10 phụ thu $7, giá từ $10+ phụ thu $9 thì [extra = 7, priceExtra = 2, priceAnchor = 10]
 - [x] **EXTRA** : 0, `// Phụ thu tính theo $/cái`
 - [x] **PRICEEXTRA** : 0, `// Phụ thu cộng thêm vào Extra khi giá >= PriceAnchor`
 - [x] **PRICEANCHOR** : 0,
 
> Phụ thu theo %
 - [x] **HVEXTRA** : 0.1 `// Phụ thu Giá Trị Cao tính theo %, chỉ cộng khi giá >= HVAnchor`
 - [x] **HVANCHOR** : 500, `// Mức sàn để phụ thu Giá Trị Cao tính theo $`
 - [x] **NAME** : "thông thường", `// Tên category`
 - [x] **NOTE** : "Phí ship $8.5/kg", `// Note để chú thích khi xuất response`

> Xét stringCategory của web, nếu có trong keyword và không có trong notKeyword thì chọn Category này
 - [x] **KEYWORD** : [],
 - [x] **NOTKEYWORD** : []

},
