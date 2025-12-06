export function buildUMKMPrompt(
  productName: string,
  businessType: string,
  theme: string,
  brandColor: string,
  targetMarket: string,
  format: string,
  additionalInfo?: string
): string {
  const themeMap: Record<string, string> = {
    'elegant': 'elegant luxury with gold accents, sophisticated presentation, premium quality',
    'cute-pastel': 'cute kawaii style with pastel colors, soft lighting, playful aesthetic',
    'bold-modern': 'bold vibrant colors, strong contrast, modern dynamic composition',
    'minimalist': 'clean minimal design, white background, simple elegant presentation',
    'premium': 'premium luxury branding, dark moody background, sophisticated lighting',
    'playful': 'fun playful composition, bright cheerful colors, energetic vibe'
  }

  const businessMap: Record<string, string> = {
    'makanan': 'delicious Indonesian food dish, appetizing presentation, steam rising, professional food photography',
    'fashion': 'fashionable clothing item, stylish presentation, studio lighting, model or mannequin',
    'kosmetik': 'beauty cosmetic product, clean elegant display, soft feminine lighting',
    'kerajinan': 'handmade craft product, artisanal authentic look, cultural elements',
    'cafe': 'cozy cafe beverage or food, lifestyle photography, warm inviting atmosphere',
    'kuliner': 'gourmet culinary creation, restaurant quality plating, professional food photography',
    'lainnya': 'professional product photography, clean studio setup'
  }

  return `High quality commercial product photography of ${productName}, ${businessMap[businessType]}, ${themeMap[theme]}, professional studio lighting, shallow depth of field, centered composition, clean neutral background, vibrant appetizing colors, Instagram-worthy, marketing material quality, 4K sharp details, no text, no watermark. ${additionalInfo || ''}`
}
