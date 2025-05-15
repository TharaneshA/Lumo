
declare module 'formidable' {
    import { EventEmitter } from 'events';
    import { IncomingMessage } from 'http';
  
    interface FormidableFile {
      size: number;
      filepath: string;
      originalFilename?: string | null;
      mimetype?: string | null;
      newFilename: string;
      hashAlgorithm?: false | 'sha1' | 'md5' | 'sha256';
      hash?: string;
    }
  
    interface Files {
      [key: string]: FormidableFile | FormidableFile[];
    }
  
    interface Fields {
      [key: string]: string | string[];
    }
  
    interface FormidableOptions {
      multiples?: boolean;
      uploadDir?: string;
      keepExtensions?: boolean;
      maxFileSize?: number;
    }
  
    class IncomingForm extends EventEmitter {
      constructor(options?: FormidableOptions);
      parse(
        req: IncomingMessage,
        callback: (
          err: any,
          fields: Fields,
          files: Files
        ) => void
      ): void;
    }
  
    export { IncomingForm, Fields, Files, FormidableFile };
  }
  