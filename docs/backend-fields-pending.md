# Product Center MasterData — Pending Backend Fields

> 前端表单已实现，但后端 `tbl_product_center_masterData` 表尚未适配的字段清单。
> 请后端按此清单在数据库表、BO、VO 中补充对应字段。

## 1. Core Fund Identity

| 字段名 (fieldName) | 表单 Label | 类型 | 值域 / 格式 | 备注 |
|---|---|---|---|---|
| `launchDate` | Launch Date | `date` | `YYYY/MM/DD` | 需确认是否已入库 |
| `complexProduct` | Complex Product | `boolean` | `Y` / `N` | 需确认是否已入库 |
| `professionalInvestorsOnly` | Professional Investors only | `boolean` | `Y` / `N` | 需确认是否已入库 |
| `applicationSubmissionDate` | Application Submission Date | `date` | `YYYY/MM/DD` | |
| `authorizationDate` | Authorization Date | `date` | `YYYY/MM/DD` | |
| `iopStartDate` | IOP Start Date | `date` | `YYYY/MM/DD` | |
| `operationStartDate` | Operation Start Date | `date` | `YYYY/MM/DD` | |
| `listingDate` | Listing Date | `date` | `YYYY/MM/DD` | |
| `terminationDate` | Termination Date | `date` | `YYYY/MM/DD` | |
| `giinNumber` | GIIN Number | `varchar` | 自由文本 | |
| `leiNumber` | LEI Number | `varchar` | 自由文本 | |
| `restrictionInvestorNationality` | Restriction on investor's nationality | `varchar` | 自由文本 | |
| `restrictionInvestorResidency` | Restriction on investor's residency | `varchar` | 自由文本 | |

## 2. Key Parties

| 字段名 (fieldName) | 表单 Label | 类型 | 备注 |
|---|---|---|---|
| `subManager` | Sub Manager | `varchar` | 支持自动联想 |
| `investmentAdvisor` | Investment Advisor | `varchar` | 支持自动联想 |
| `trusteeAdministrator` | Trustee / Administrator | `varchar` | 支持自动联想 |
| `custodianPrimeBroker` | Custodian / Prime Broker | `varchar` | 支持自动联想 |
| `subCustodian` | Sub Custodian | `varchar` | |
| `auditor` | Auditor | `varchar` | 支持自动联想 |

## 3. Investment Strategy

| 字段名 (fieldName) | 表单 Label | 类型 | 值域 / 格式 |
|---|---|---|---|
| `passiveOrActiveFund` | Passive or Active Fund | `varchar` | `Active` / `Passive` |
| `morningstarCategory` | Strategy Category (MorningStar) | `varchar` | 自由文本 |
| `investmentMarketFocus` | Investment Market Focus | `varchar` | `America` / `Asia Pacific` / `Emerging Markets` / `Europe` / `Global` |
| `investmentObjective` | Investment Objective | `varchar` | 多行文本 |
| `investmentStrategy` | Investment Strategy | `varchar` | 多行文本 |
| `assetAllocationTable` | Asset Allocation Table | `varchar` | 多行文本 |
| `hedgingPolicyFund` | Hedging Policy (Fund) | `varchar` | `Hedge to Base Currency` / `Optional` / `N/A` |
| `benchmarkCode` | Benchmark Code | `varchar` | 自由文本 |

## 4. Foreign Registration Status

所有字段类型为 `varchar(1)`，值域 `Y` / `N`。

| 字段名 (fieldName) | 表单 Label (国家/地区) |
|---|---|
| `registrationUs` | United States |
| `registrationSingapore` | Singapore |
| `registrationMacau` | Macau |
| `registrationTaiwan` | Taiwan |
| `registrationSwitzerland` | Switzerland |
| `registrationUk` | United Kingdom |
| `registrationGermany` | Germany |
| `registrationItaly` | Italy |
| `registrationSpain` | Spain |
| `registrationFrance` | France |
| `registrationIreland` | Ireland |
| `registrationSweden` | Sweden |
| `registrationFinland` | Finland |
| `registrationDenmark` | Denmark |
| `registrationNorway` | Norway |
| `registrationNetherlands` | Netherlands |
| `registrationLuxembourg` | Luxembourg |
| `registrationCaymanIslands` | Cayman Islands |
| `registrationPrc` | PRC |
| `registrationHongKong` | Hong Kong |
| `registrationJapan` | Japan |
| `registrationMalaysia` | Malaysia |

## 5. 其他

| 字段名 (fieldName) | 表单 Label | 类型 | 备注 |
|---|---|---|---|
| `fundNameChinese` | Fund Name (Chinese) | `varchar` | 中文基金名，Operational Team 也有此字段 |
| `uploadTime` | Upload Time | `datetime` | Excel 导入时自动填充 |
| `uploadBy` | Upload By | `varchar` | Excel 导入时自动填充 |

---

## 统计

| 分类 | 数量 |
|---|---|
| Core Fund Identity | 13 |
| Key Parties | 6 |
| Investment Strategy | 8 |
| Foreign Registration Status | 22 |
| 其他 | 3 |
| **合计** | **52** |
