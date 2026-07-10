---
'@adyen/adyen-web': patch
---

Stop displaying installments defined at the component level when in a sessions integration, and put a warning message in the console. This installment configuration could end up in being shown in the UI, but was then always ignored by the backend.
