# Product Center - Backend API Requirements (v1)

> **版本**: v1.0  
> **前端项目**: `vp-product-center-fe`  
> **更新日期**: 2026-04-28

---

## 一、概述

Product Center 包含两个菜单（Product Team、Operational Team），前端已按需求文档完成表单校验、字段布局、交互逻辑。后端需提供以下 API。

**前端路由**:
- `Fund → Product Team`: `/fund/product-team`
- `Fund → Operational Team`: `/fund/operational-team`

---

## 二、菜单一：Product Team（基金基本信息）

### 2.1 API 列表

| API | Method | 说明 |
|-----|--------|------|
| `/product-center/fund/product/list` | GET | 分页列表查询 |
| `/product-center/fund/product/{id}` | GET | 详情 |
| `/product-center/fund/product` | POST | 新增 |
| `/product-center/fund/product` | PUT | 修改 |
| `/product-center/fund/product/{ids}` | DELETE | 删除（支持批量） |
| `/product-center/fund/product/export` | POST | 导出 Excel |
| `/product-center/fund/product/import` | POST | 导入 Excel（multipart/form-data） |
| `/product-center/fund/product/importTemplate` | GET | 下载导入模板 |
| `/product-center/fund/product/check-unique` | GET | 唯一性校验 |

### 2.2 列表查询参数

```
GET /product-center/fund/product/list?pageNum=1&pageSize=10
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | number | ✓ | 页码 |
| pageSize | number | ✓ | 每页条数 |
| fundCode | string | | 模糊匹配 |
| fundNameEn | string | | 模糊匹配 |
| fundNameTcSc | string | | Fund Name(TC) OR Fund Name(SC) 模糊匹配 |
| fundType | string[] | | 多选 |
| primaryInstrumentType | string[] | | 多选 |
| umbrellaOfcName | string | | 模糊匹配 |

**返回格式**:
```json
{
  "rows": [ FundProduct, ... ],
  "total": 100
}
```

### 2.3 唯一性校验

```
GET /product-center/fund/product/check-unique?field=fundCode&value=VPAF&excludeId=1
```

| 参数 | 说明 |
|------|------|
| field | 校验字段：fundCode / fundNameEn / fundNameTc / fundNameSc |
| value | 待校验值 |
| excludeId | 排除的记录 ID（修改时使用） |

返回：冲突时返回字段名（如 `"fundCode"`），无冲突返回 `null`。

### 2.4 完整字段定义

#### Core Fund Identity

| 字段名 | 类型 | 必填 | 校验规则 |
|--------|------|------|----------|
| fundCode | string | ✓ | max 20 |
| fundNameEn | string | ✓ | max 200 |
| fundNameTc | string | ✓ | max 200 |
| fundNameSc | string | ✓ | max 200 |
| fundType | enum | ✓ | SFC Authorized Fund(UT/OFC/Cayman/ICAV), Private Fund(Cayman/Chinese Mainland), Investment Advisory(Offshore/Chinese Mainland), Other Mutual Fund |
| umbrellaOfcName | string | | |
| subFundCode | string | | |
| domicileJurisdiction | string | ✓ | ISO 3166-1 2字母国家代码（下拉选择，非自由输入） |
| primaryRegulator | string | ✓ | |
| baseCurrency | string | | ISO 4217 3字母货币代码（下拉选择，非自由输入） |
| fundStatus | enum | ✓ | In Offering / Active / In Liquidation / Liquidated |
| applicationSubmissionDate | date | | `YYYY/MM/DD` |
| authorizationDate | date | | `YYYY/MM/DD` |
| launchDate | date | ✓ | `YYYY/MM/DD` |
| complexProduct | enum | ✓ | Y / N |
| iopStartDate | date | | `YYYY/MM/DD` |
| operationStartDate | date | | `YYYY/MM/DD` |
| listingDate | date | | `YYYY/MM/DD` |
| terminationDate | date | | `YYYY/MM/DD` |
| leiNumber | string | | 20 位字母数字 |
| giinNumber | string | | 格式：XXXXXX.XXXXX.XX.XX |
| professionalInvestorsOnly | enum | | Y / N |
| restrictionInvestorNationality | string | | |
| restrictionInvestorResidency | string | | |

#### Key Parties

| 字段名 | 类型 | 必填 |
|--------|------|------|
| fundManager | string | ✓ |
| fundManagerLei | string | ✓ |
| subManager | string | |
| investmentAdvisor | string | |
| trusteeAdministrator | string | |
| custodianPrimeBroker | string | |
| subCustodian | string | |
| auditor | string | |

#### Investment Strategy

| 字段名 | 类型 | 必填 | 校验规则 |
|--------|------|------|----------|
| primaryInstrumentType | enum | ✓ | Alternative / Commodities / Digital Assets / Equity / Fixed Income / Money Market / Multi-Assets |
| passiveOrActiveFund | enum | ✓ | Active / Passive |
| morningstarCategory | string | | |
| investmentMarketFocus | enum | ✓ | America / Asia Pacific / Emerging Markets / Europe / Global |
| investmentObjective | text | ✓ | max 2000 |
| investmentStrategy | text | ✓ | max 2000 |
| assetAllocationTable | text | ✓ | max 4000（v2 将支持图片上传） |
| hedgingPolicyFund | enum | ✓ | Hedge to Base Currency / Optional / N/A |
| benchmark | string | | |
| benchmarkCode | string | | |
| leverageRatioMax | number | ✓ | 非负整数 |
| derivativesRatioMax | number | ✓ | 非负整数 |
| borrowingLimit | number | ✓ | 非负整数 |
| stopLossLimit | number | | 最多 2 位小数，非负 |
| stopLossAlert | number | | 最多 2 位小数，非负 |
| riskRating | enum | ✓ | 1 / 2 / 3 / 4 / 5 |

#### Foreign Registration Status（全部必填，默认 N）

| 字段名 | 类型 | 值 |
|--------|------|-----|
| registrationCaymanIslands | enum | Y / N |
| registrationDenmark | enum | Y / N |
| registrationFinland | enum | Y / N |
| registrationFrance | enum | Y / N |
| registrationGermany | enum | Y / N |
| registrationHongKong | enum | Y / N |
| registrationIreland | enum | Y / N |
| registrationItaly | enum | Y / N |
| registrationJapan | enum | Y / N |
| registrationLuxembourg | enum | Y / N |
| registrationMacau | enum | Y / N |
| registrationMalaysia | enum | Y / N |
| registrationNetherlands | enum | Y / N |
| registrationNorway | enum | Y / N |
| registrationPrc | enum | Y / N |
| registrationSingapore | enum | Y / N |
| registrationSpain | enum | Y / N |
| registrationSweden | enum | Y / N |
| registrationSwitzerland | enum | Y / N |
| registrationTaiwan | enum | Y / N |
| registrationUk | enum | Y / N |
| registrationUs | enum | Y / N |

### 2.5 菜单配置

后端权限系统需添加菜单：`Fund → Product Team`

---

## 三、菜单二：Operational Team（基金运营信息）

### 3.1 API 列表

| API | Method | 说明 |
|-----|--------|------|
| `/product-center/fund/share-class/list` | GET | 分页列表查询 |
| `/product-center/fund/share-class/{id}` | GET | 详情 |
| `/product-center/fund/share-class` | POST | 新增 |
| `/product-center/fund/share-class` | PUT | 修改 |
| `/product-center/fund/share-class/{ids}` | DELETE | 删除（支持批量） |
| `/product-center/fund/share-class/export` | POST | 导出 Excel |
| `/product-center/fund/share-class/import` | POST | 导入 Excel |
| `/product-center/fund/share-class/importTemplate` | GET | 下载导入模板 |
| `/product-center/fund/share-class/check-unique` | GET | 唯一性校验 |

### 3.2 列表查询参数

```
GET /product-center/fund/share-class/list?pageNum=1&pageSize=10
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | number | ✓ | |
| pageSize | number | ✓ | |
| fundCode | string | | 模糊匹配 |
| fundNameEnTcSc | string | | Fund Name(EN) OR Fund Name(TC) OR Fund Name(SC) 模糊匹配 |
| shareClassNameEnTcSc | string | | Share Class Name(EN) OR Share Class Name(TC) OR Share Class Name(SC) 模糊匹配 |
| classCurrency | string[] | | 多选 |
| classStatus | string[] | | 多选 |

**返回格式**:
```json
{
  "rows": [ ShareClass, ... ],
  "total": 100
}
```

### 3.3 唯一性校验

```
GET /product-center/fund/share-class/check-unique?fundCode=VPAF&shareClassNameEn=Class+A&vpfsClassId=A&excludeId=1
```

校验规则：**Fund Code + Share Class Name (EN) + VPFS Class ID** 三者组合不能重复。

返回：`{ "unique": true }` 或 `{ "unique": false }`。

### 3.4 Fund Info 关联查询

新增/修改 Share Class 时，选择 Fund Code 需自动带出关联的 Fund 信息。

```
GET /product-center/fund/product/lookup?fundCode=VPAF
```

返回：`{ fundCode, fundNameEn, fundNameTc, fundNameSc }`（仅 Fund Info 需要的字段）

### 3.5 完整字段定义

#### Fund Info（由 Fund Code 关联，自动带出，不可编辑）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| fundCode | string | 基金代码（下拉选择） |
| fundNameEn | string | 英文名（auto-populated） |
| fundNameTc | string | 繁体中文名（auto-populated） |
| fundNameSc | string | 简体中文名（auto-populated） |

#### Class Info

| 字段名 | 类型 | 必填 | 校验/说明 |
|--------|------|------|-----------|
| shareClassNameEn | string | ✓ | max 200 |
| shareClassNameTc | string | ✓ | max 200 |
| shareClassNameSc | string | ✓ | max 200 |
| vpfsClassId | string | | 内部 ID（如 A, B, C） |
| isinCode | string | | 2字母+10位字母数字 |
| cusip | string | | 9位字母数字 |
| bloombergTicker | string | | |
| bbgIdEquity | string | | |
| sedol | string | | 7位字母数字 |
| morningstarFundId | string | | |
| morningstarSecId | string | | |
| morningstarPerformanceId | string | | |
| stockCode | string | | 1-5位数字 |
| valorCode | string | | |
| lipperCode | string | | |
| classStatus | enum | ✓ | Active / Inactive / Terminated |
| classCurrency | enum | ✓ | EUR/HKD/CNH/SGD/USD/CHF/GBP/AUD/CAD/NZD/CNY/RMB/JPY |
| endOfIopDate | date | | YYYY/MM/DD |
| launchDate | date | ✓ | YYYY/MM/DD |
| latestTerDate | date | | YYYY/MM |
| latestTerRate | number | | 2位小数，非负 |
| distributionPolicy | enum | ✓ | Monthly / Quarterly / Annually / N/A |
| hedged | enum | ✓ | Y / N。EN名称含"Hedged"默认Y；N时清空hedgingCurrency |
| hedgingCurrency | enum | 条件必填 | Hedged=Y时必填，同 classCurrency 选项 |
| unitPrecision | enum | ✓ | 2 / 3 / 4 |
| navPrecision | enum | ✓ | 0 / 2 / 4 |
| subscriptionSettlement | string | ✓ | T+X，整数非负 |
| redemptionSettlement | string | ✓ | T+X，整数非负 |
| minimumInitialSubscription | string | ✓ | |
| minimumSubsequentSubscription | string | ✓ | |
| minimumRedemption | string | ✓ | |
| minimumHolding | string | | |
| redemptionCharge | string | | |
| managementFee | number | | 2位小数，非负 |
| performanceFee | number | | 2位小数，非负 |
| financialYearEnd | enum | | 31-March / 30-June / 31-December |

#### Dealing & Valuation

| 字段名 | 类型 | 必填 | 校验/说明 |
|--------|------|------|-----------|
| dealingFrequency | enum | ✓ | Daily / Weekly / Monthly / Quarterly / Yearly |
| valuationFrequency | enum | ✓ | 同上 |
| dealingCutOff | string | ✓ | HH:MM 格式 |
| dealingCutOffTz | enum | ✓ | HKG/IRL/CHN/AUS/CAN/FRA/DEU/JPN/LUX/SGP/CHE/TWN/GBR/USA |
| valuationPoint | string | ✓ | HH:MM 格式 |
| valuationPointTz | enum | ✓ | 同 dealingCutOffTz |
| businessDayDefinition | string | ✓ | |
| businessCalendar | enum[] | ✓ | 多选：HK/TW/JP/PRC-SE/PRC-Bank/IRE/UK/Relevant Market |
| contractNoteDeliveryDay | string | | T+X，整数非负 |
| pricingMethodology | enum[] | ✓ | 多选：Amortization / Cost / Mark to Market |
| valuationDeliveryTime | string | | T+X，整数非负 |
| securityLending | enum | | Y / N |

### 3.6 菜单配置

后端权限系统需添加菜单：`Fund → Operational Team`

### 3.7 待确认事项

- 运营团队列表当前为扁平列表，v2 考虑树形展示（按 Fund Code 分组）

---

## 四、后续版本（v2）

### 4.1 文件上传（Asset Allocation Table）

Product Team 的 Asset Allocation Table 字段需支持图片上传。

**API**: `POST /resource/oss/upload`（框架已有）

| 参数 | 说明 |
|------|------|
| file | 图片文件（multipart/form-data） |

| 返回 | 类型 |
|------|------|
| url | string |
| fileName | string |
| ossId | string |

**前端逻辑**: 上传成功后自动将 `![image](url)` 插入到 textarea 内容中。

### 4.2 文本框自动联想（Autocomplete）

Key Parties 和 Investment Strategy 中的所有文本字段需支持「存量数据自动联想」——输入时从已有数据中匹配，按出现频次降序显示。

**API**: `GET /product-center/fund/product/autocomplete?field=xxx&keyword=xxx`

| 参数 | 说明 |
|------|------|
| field | 列名（需白名单校验） |
| keyword | 用户输入关键词 |

返回：`string[]`，按频率降序排列。

**field 白名单**（v2 扩展后）：
`fundManager`, `fundManagerLei`, `subManager`, `investmentAdvisor`, `trusteeAdministrator`, `custodianPrimeBroker`, `subCustodian`, `auditor`, `benchmark`

SQL 示例：
```sql
SELECT field_name, COUNT(*) cnt
FROM tbl_product_center_masterData
WHERE field_name LIKE '%keyword%'
GROUP BY field_name
ORDER BY cnt DESC
LIMIT 20
```

### 4.3 Documents 菜单

`Fund → Documents` 菜单，前端路由已准备就绪，v2 版本启用。涉及文件上传、下载、分类管理等功能。API 待定。

---

## 五、通用

### 5.1 日期格式

所有日期字段前端提交格式为 `YYYY/MM/DD`（如 `2026/04/28`）。如后端期望 ISO 格式 `YYYY-MM-DD`，请告知。

### 5.2 响应格式

所有列表 API 返回：
```json
{
  "rows": [...],
  "total": 100
}
```

### 5.3 成功/失败提示

前端通过 `window.message.success()` / `window.message.error()` 显示操作结果。后端返回标准 HTTP 状态码即可，前端已有统一请求拦截器处理。
