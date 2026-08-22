---
name: Payment and authentication boundaries
description: Current production boundary for Fabric Infinity payments and customer authentication.
---

Razorpay server-side order creation and signature verification are integrated and working with test credentials; OTP sessions are implemented, but delivery is still demo-only until an SMS/email provider is connected, and Google OAuth is not yet implemented.

**Why:** Payment testing proved the gateway connection is real, while customer delivery requires provider credentials and Google login requires a separate OAuth application.

**How to apply:** Keep Razorpay secrets server-only, remove demo OTP responses before launch, and add provider/webhook hardening before switching to live payments.