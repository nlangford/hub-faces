export interface History { 
  img: string
  coords: FaceCoords[]
}

export interface FaceDetect {
  faces: FaceCoords[]
  status: number
}

export interface Mogrify {
    ssl_link: string
    link: string
    id: string
    status: number
}

export interface FaceCoords  {
  face_id: number
  left: number
  right: number
  bottom:  number
  top: number
  width: number
  height: number
}