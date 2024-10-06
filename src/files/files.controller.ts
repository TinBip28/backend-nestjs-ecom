import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from '../decorator/customize';

@Controller('files')
export class FilesController {
  /** Upload single file */
  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Upload single file')
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|image\/jpeg|png|image\/png|gif|txt|pdf|application\/pdf|doc|docx|text\/plain)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 2000 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return {
      message: 'File uploaded successfully',
      file: {
        originalName: file.originalname,
        fileName: file.filename,
        size: file.size,
      },
    };
  }

  /** Upload multiple files */
  @Public()
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files[]', 10))
  @ResponseMessage('Upload multiple files')
  uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|image\/jpeg|png|image\/png|gif|txt|pdf|application\/pdf|doc|docx|text\/plain)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 10000 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    return {
      message: 'Files uploaded successfully',
      fileCount: files.length,
      files: files.map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        size: file.size,
      })),
    };
  }
}
