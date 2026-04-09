declare module 'ali-oss' {
  interface OSSClientOptions {
    region: string
    accessKeyId: string
    accessKeySecret: string
    bucket: string
  }

  interface SignatureOptions {
    expires: number
  }

  export default class OSS {
    constructor(options: OSSClientOptions)
    signatureUrl(filePath: string, options: SignatureOptions): string
  }
}
