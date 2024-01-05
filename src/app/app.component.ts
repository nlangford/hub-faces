import { Component, ElementRef, ViewChild, Self, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FaceCoords, FaceDetect, Mogrify, History } from './domain';

const LOCAL_STORE = 'hubfaces-history'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent {
  @ViewChild('imageInput') imageInput: ElementRef<HTMLInputElement> | undefined;

  title = 'hubfaces';
  uploadedFileLocation: string = ''
  uploading: boolean = false;
  detecting: boolean = false
  blurring: boolean = false
  history: History[] = []
  historySelectedIndex?: number = undefined
  facesDetected: boolean = false
  selectedFaces: number[] = []

  constructor(private http: HttpClient) {}

  ngOnInit()  {
      this.history = JSON.parse(localStorage.getItem(LOCAL_STORE) ?? '[]')
  }

  async onFileSelected(event: Event) {
    this.uploading = true
    const input = event.target as HTMLInputElement

    if (!input.files?.length) return

    const file = input.files[0]

    if (file) {
      await this.uploadImage(file)
    }

    this.uploading = false
  }

  async uploadImage(file: File)  {    
    const formData = new FormData()
    formData.append('img', file)
    
    // ToDo: this endpoint not working properly
    await this.http.post(
        'http://localhost:4200/api/upload', 
        formData
      ).toPromise()

    // ToDo: set the response image url to this
    this.uploadedFileLocation = 'http://pixlab.io/images/m3.jpg'
  }

  async detectFaces()  {  
    this.detecting = true

    if (this.uploadedFileLocation !== '')  {
      const response = await this.http.get<FaceDetect>(`http://localhost:4200/api/facedetect?img=${this.uploadedFileLocation}`).toPromise()

      if(response && response?.status === 200) {
        this.facesDetected = true
        this.history.unshift({img: this.uploadedFileLocation, coords: response.faces})
        if (this.history.length > 2) {
          this.history.splice(3)
        }
        localStorage.setItem(LOCAL_STORE, JSON.stringify(this.history))
        this.drawRectangles(response.faces)
        this.historySelectedIndex = 0
      }
    }

    this.detecting = false
  }

  async blurFaces()  {   
    this.blurring = true 
    let {img, coords} = this.history[this.historySelectedIndex ?? 0]
    let blurCoords = coords.filter(coord => this.selectedFaces.includes(coord.face_id))
    let nonBlurCoords = coords.filter(coord => !this.selectedFaces.includes(coord.face_id))

    const response = await this.http.post<Mogrify>('http://localhost:4200/api/mogrify', 
    {
      img,
      coords: blurCoords
    }).toPromise()

    if(response && response?.status === 200) {
      this.history[this.historySelectedIndex ?? 0] = { img: response.link, coords: nonBlurCoords }
      this.uploadedFileLocation = response.link
      localStorage.setItem(LOCAL_STORE, JSON.stringify(this.history))
      this.drawRectangles(nonBlurCoords)
      this.selectedFaces = []
    }

    this.blurring = false
  }

  loadHistoricalFaces(faces: History)  {
    this.uploadedFileLocation = faces.img
    this.facesDetected = true
    this.historySelectedIndex = this.history.indexOf(faces)
    this.selectedFaces = []
    this.drawRectangles(faces.coords)
  }

  drawRectangles(coords: FaceCoords[]) {
    this.removeRectangles()

    
    setTimeout(() => {
      coords.forEach((coord) => {
        var div = document.createElement('div')
        
        div.id = `${coord.face_id}`
        div.className = 'coordinate-div'
        div.style.left = `${coord.left}px`
        div.style.top = `${coord.top}px`
        div.style.width = `${coord.width}px`
        div.style.height = `${coord.height}px`
        div.style.position = 'absolute'
        div.style.border = '2px solid white'
        div.style.cursor = 'pointer'
        div.style.backgroundColor = '#111111'
        div.style.opacity = '0.5'

        // Add a click event listener
        div.addEventListener('click', (event): void => {
            if (event.target) {
              // @ts-ignore
              if(event.target.style.border.includes('white')) {
                // @ts-ignore
                event.target.style.border = '2px solid green'
                // @ts-ignore
                this.selectedFaces.push(Number(event.target.id))
              } else {
                // @ts-ignore
                event.target.style.border = '2px solid white'
              }
            }
        });

        // Add a mouseenter event listener
        div.addEventListener('mouseenter', (event): void => {
          // @ts-ignore
          event.target.style.opacity = 0.3
        });

        // Add a mouseleave event listener
        div.addEventListener('mouseleave', (event): void => {
          // @ts-ignore
          event.target.style.opacity = 0.5
        });

        const imageContainer = document.getElementById('image-container')

        imageContainer?.appendChild(div)
      })
    }, 20)
  }

  removeRectangles() {
    const elements = document.getElementsByClassName('coordinate-div')

    if (elements) {
      Array.from(elements).forEach(element => {
        element.remove()
      })
    }
  }

  reset()  {
    this.uploadedFileLocation=''
    this.facesDetected=false
    this.historySelectedIndex = undefined;
    this.selectedFaces = []
  }
}
