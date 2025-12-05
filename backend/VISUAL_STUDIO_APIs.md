# 🎨 Visual Studio - External APIs Integration

## Configured APIs for Visual Studio Feature

### 1. **Sightengine AI** - Image Quality Analysis
**Purpose:** Analyze image quality (sharpness, contrast, brightness, colors)

**Setup:**
1. Register at: https://sightengine.com/
2. Get your API credentials from dashboard
3. Add to `.env`:
```env
SIGHTENGINE_USER=your_user_id
SIGHTENGINE_SECRET=your_secret_key
```

**Pricing:** Free tier: 2,000 requests/month

---

### 2. **Pixian.ai** - Background Removal
**Purpose:** Remove background from product/food photos

**Setup:**
1. Register at: https://pixian.ai/api
2. Get API key from dashboard
3. Add to `.env`:
```env
PIXIAN_API_KEY=your_pixian_api_key
```

**Pricing:** Free tier: 25 images/month, Paid: $0.06/image

**Alternative:** Remove.bg (https://remove.bg/api) - Same integration pattern

---

### 3. **Replicate (Flux)** - AI Template Generation
**Purpose:** Generate social media templates with AI

**Setup:**
1. Register at: https://replicate.com/
2. Get API token from: https://replicate.com/account/api-tokens
3. Add to `.env`:
```env
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxx
```

**Model Used:** `black-forest-labs/flux-schnell` (Fast generation ~10s)

**Pricing:** 
- Flux Schnell: ~$0.003/image (fast)
- Flux Pro: ~$0.055/image (high quality)

**Alternative Models:**
- Stable Diffusion XL: Cheaper but slower
- DALL-E 3: Higher quality but expensive

---

## 📝 Complete .env Example

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Kolosal AI (for text generation)
KOLOSAL_API_KEY=sk-your-kolosal-key

# Visual Studio External APIs
SIGHTENGINE_USER=123456789
SIGHTENGINE_SECRET=your_sightengine_secret
PIXIAN_API_KEY=px_your_pixian_key
REPLICATE_API_KEY=r8_your_replicate_token

# Server
PORT=3000
```

---

## 🔄 Fallback Behavior

Jika API keys tidak dikonfigurasi:

1. **Sightengine** → Fallback ke Sharp.js (local image analysis)
   - Still works! But less accurate
   - No external API calls
   
2. **Pixian.ai** → Returns error message
   - User will see: "API not configured"
   - Feature disabled
   
3. **Replicate/Flux** → Returns error message
   - User will see: "API not configured"
   - Feature disabled

---

## 🧪 Testing Without API Keys

Untuk testing tanpa API keys:

```bash
# Set mock mode di .env
USE_MOCK_AI=true
```

Mock mode will:
- Generate realistic fake scores for image analysis
- Simulate background removal (returns same image)
- Skip template generation (returns placeholder)

---

## 💰 Cost Estimation (Per Month)

**Scenario: 100 users, 10 uploads each = 1,000 images/month**

| Service | Cost | Notes |
|---------|------|-------|
| Sightengine | **FREE** | Within 2,000 req/month |
| Pixian.ai | **$60** | $0.06 × 1,000 images |
| Replicate Flux | **$3** | $0.003 × 1,000 images |
| **TOTAL** | **~$63/month** | For 1,000 images |

**Optimization Tips:**
1. Cache analysis results (same image = reuse score)
2. Limit background removal to premium users
3. Generate templates in batch
4. Use cheaper Stable Diffusion for templates (~$0.001/image)

---

## 🔐 Security Best Practices

1. **Never commit .env file**
   ```bash
   # Already in .gitignore
   .env
   ```

2. **Use environment variables in production**
   - Railway: Add in dashboard
   - Vercel: Add in project settings
   - Heroku: `heroku config:set KEY=value`

3. **Rotate API keys regularly**
   - Monthly rotation recommended
   - Revoke old keys after migration

---

## 📊 Monitoring API Usage

### Sightengine
Dashboard: https://sightengine.com/dashboard/api-usage

### Pixian.ai
Dashboard: https://pixian.ai/dashboard

### Replicate
Dashboard: https://replicate.com/account/billing

**Set up alerts** when approaching free tier limits!

---

## 🛠️ Troubleshooting

### Error: "Sightengine API failed"
- ✅ Check SIGHTENGINE_USER and SIGHTENGINE_SECRET in .env
- ✅ Verify API quota not exceeded
- ✅ Fallback to Sharp.js will activate automatically

### Error: "Pixian API not configured"
- ✅ Check PIXIAN_API_KEY in .env
- ✅ Verify billing is active
- Alternative: Use Remove.bg API

### Error: "Replicate timeout"
- ✅ Model might be cold starting (first request slow)
- ✅ Wait 30 seconds and retry
- ✅ Check REPLICATE_API_KEY validity

---

## 🚀 Production Deployment

### Railway / Render / Fly.io

```bash
# Add environment variables in dashboard
SIGHTENGINE_USER=xxx
SIGHTENGINE_SECRET=xxx
PIXIAN_API_KEY=xxx
REPLICATE_API_KEY=xxx
```

### Docker

```dockerfile
ENV SIGHTENGINE_USER=xxx
ENV SIGHTENGINE_SECRET=xxx
ENV PIXIAN_API_KEY=xxx
ENV REPLICATE_API_KEY=xxx
```

---

## 📞 Support

- Sightengine: support@sightengine.com
- Pixian.ai: support@pixian.ai
- Replicate: support@replicate.com

---

**Last Updated:** December 6, 2025
