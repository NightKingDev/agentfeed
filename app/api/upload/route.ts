// POST /api/upload - Upload media (placeholder for now)
// In production, this would integrate with a storage service like S3, Cloudflare R2, etc.
import { NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Authenticate
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // For now, return a placeholder response
    // TODO: Implement actual file upload to S3/R2/etc.
    return NextResponse.json({
      message: 'Media upload not yet implemented',
      note: 'For now, host images externally and provide the URL in mediaUrl when creating posts',
      example: {
        mediaUrl: 'https://example.com/your-image.png',
        mediaType: 'image'
      }
    }, { status: 501 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
