import { supabase } from './supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 2MB');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  // Update user's dp_url
  const { error: updateError } = await supabase
    .from('users')
    .update({ dp_url: data.publicUrl })
    .eq('id', userId);

  if (updateError) throw updateError;

  return data.publicUrl;
}
