export interface NPMView {
    _id: string
    _rev: string
    name: string
    "dist-tags": DistTags
    versions: string[]
    time: any,
    maintainers: string[]
    description: string
    homepage: string
    keywords: string[]
    repository: Repository
    author: string
    bugs: Bugs
    license: string
    readmeFilename: string
    _cached: boolean
    _contentLength: number
    version: string
    main: string
    module: string
    types: string
    unpkg: string
    scripts: any,
    devDependencies: any,
    peerDependencies: any,
    prettier: string
    swiftlint: string,
    gitHead: string
    _nodeVersion: string
    _npmVersion: string
    dist: Dist
    _npmUser: string
    directories: Directories
    _npmOperationalInternal: NpmOperationalInternal
    _hasShrinkwrap: boolean
  }
  
  export interface DistTags {
    latest: string
    next: string
  }
  

  
  export interface Repository {
    type: string
    url: string
  }
  
  export interface Bugs {
    url: string
  }
  

  
  export interface Dist {
    integrity: string
    shasum: string
    tarball: string
    fileCount: number
    unpackedSize: number
    signatures: Signature[]
    "npm-signature": string
  }
  
  export interface Signature {
    keyid: string
    sig: string
  }
  
  export interface Directories {}
  
  export interface NpmOperationalInternal {
    host: string
    tmp: string
  }
  