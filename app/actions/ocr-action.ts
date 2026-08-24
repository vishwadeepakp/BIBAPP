'use server';

import { createClient } from '@supabase/supabase-js';

// चेक करो कि ये दोनों ठीक से आ रहे हैं या नहीं
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY exists?:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processBillAction(base64Image: string) {
  try {
    const fileName = `bill_${Date.now()}.jpg`;

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // यहाँ बकेट का नाम चेक कर लो - क्या Supabase में बकेट का नाम सच में 'bills' ही है?
    const { data, error } = await supabaseAdmin.storage
      .from('bills')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error("Supabase Internal Error Object:", error);
      throw new Error(error.message);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('bills')
      .getPublicUrl(data.path);

    return { success: true, publicUrl: urlData.publicUrl, filePath: data.path };

  } catch (err: any) {
    console.error('Final Catch Error:', err);
    return { success: false, error: err.message };
  }
}