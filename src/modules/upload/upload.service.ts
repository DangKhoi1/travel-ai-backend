import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly configured: boolean;
  constructor(config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    this.configured = !!(cloudName && apiKey && apiSecret);
    if (this.configured)
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!this.configured)
      throw new ServiceUnavailableException('Image storage is not configured');
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'travel-ai',
          resource_type: 'image',
          transformation: [
            {
              width: 1600,
              height: 1200,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, response) => {
          if (error) reject(new Error(error.message));
          else if (!response)
            reject(new Error('Cloudinary returned no result'));
          else resolve(response);
        },
      );
      stream.end(file.buffer);
    });
    return {
      EC: 0,
      EM: 'Image uploaded',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    };
  }
}
