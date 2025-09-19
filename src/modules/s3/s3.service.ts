import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private baseUrl = process.env.ASSETS_BASE_URL!;
  private apiKey = process.env.ASSETS_API_KEY!;

  async upload(
    file: Express.Multer.File,
  ): Promise<{ url: string; id: string } | undefined> {
    const uploadUrl = `${this.baseUrl}/upload/`;

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': file.mimetype,
        },
        body: new Uint8Array(file.buffer),
      });
      if (res.ok) {
        const data = (await res.json()) as { url: string; id: string };
        const id: string = data.id;
        return { url: `${this.baseUrl}/${id}`, id };
      }
    } catch (error) {
      throw new Error('Error uploading file to S3: ' + error);
    }
  }

  async delete(key: string) {
    const deleteUrl = `${this.baseUrl}/delete/${key}`;
    try {
      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      if (res.ok) return { success: true };
    } catch (error) {
      throw new Error('Error deleting file from S3: ' + error);
    }
  }

  async get(key: string) {
    const getUrl = `${this.baseUrl}/${key}`;
    try {
      const res = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType =
          res.headers.get('content-type') || 'application/octet-stream';
        const contentLength = res.headers.get('content-length');

        return {
          buffer,
          contentType,
          size: contentLength ? parseInt(contentLength) : buffer.length,
          key,
        };
      } else {
        throw new Error(
          `Failed to fetch file: ${res.status} ${res.statusText}`,
        );
      }
    } catch (error) {
      console.error('Error fetching file from S3:', error);
      throw error;
    }
  }
}
