// Quick test for UMKM Branding endpoint

const API_URL = 'https://dcc-hackathon-backend.vercel.app';

async function testUMKMBranding() {
  console.log('🧪 Testing UMKM Branding endpoint...\n');

  const testData = {
    productName: "Nasi Goreng Spesial",
    businessType: "makanan",
    theme: "minimalist",
    brandColor: "#FF6347",
    targetMarket: "Mahasiswa dan pekerja 20-35 tahun",
    format: "instagram-square",
    additionalInfo: "Promo spesial weekend diskon 20%"
  };

  console.log('📤 Sending request:', testData);

  try {
    const response = await fetch(`${API_URL}/api/visual-studio/generate-umkm-branding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', result);
      return;
    }

    console.log('\n✅ Success!');
    console.log('Status:', result.success);
    console.log('Has Design:', !!result.data?.designResult?.imageBase64);
    console.log('Marketing Suggestions:', !!result.data?.marketingSuggestions);
    console.log('Processing Time:', result.data?.metadata?.processingTime + 'ms');
    
    if (result.data?.marketingSuggestions) {
      console.log('\n📝 Caption Preview:');
      console.log(result.data.marketingSuggestions.caption.substring(0, 100) + '...');
      console.log('\n🏷️ Hashtags:', result.data.marketingSuggestions.hashtags.slice(0, 5).join(' '));
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testUMKMBranding();
