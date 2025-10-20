import { Injectable } from '@nestjs/common';
import JSZip from 'jszip';
import { ExportOptions } from '../../shared/types';

@Injectable()
export class ExportService {
  /**
   * Create a ZIP file from multiple files
   * @param files - An array of files to include in the ZIP
   * @returns A Promise that resolves to a Buffer containing the ZIP file
   */
  async createZip(
    files: Array<{ name: string; content: string }>,
  ): Promise<Buffer> {
    const zip = new JSZip();

    // Add files to the ZIP archive
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });

    // Generate the ZIP file as a buffer
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Export files based on provided options
   * @param files - An array of files to export
   * @param options - Export options
   * @returns A Promise that resolves to the exported data
   */
  async export(
    files: Array<{ name: string; content: string }>,
    options: ExportOptions,
  ): Promise<Buffer | string> {
    if (options.format === 'zip') {
      return await this.createZip(files);
    }

    return JSON.stringify(files, null, 2);
  }

  /**
   * Add metadata to files
   * @param files - An array of files
   * @param metadata - Metadata to add
   * @returns Files with metadata
   */
  addMetadata(
    files: Array<{ name: string; content: string }>,
    metadata: Record<string, any>,
  ): Array<{ name: string; content: string; metadata: Record<string, any> }> {
    return files.map((file) => ({
      ...file,
      metadata,
    }));
  }
}
