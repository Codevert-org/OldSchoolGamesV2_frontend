import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import getCroppedImg from '../../utils/canvasUtils';

import { Button } from '../Button/Button';
import './CropperModal.css';

type avatar = {
  setImage: Dispatch<SetStateAction<string>>;
  croppedImage: string
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function CropperModal({ setImage, croppedImage, showModal, setShowModal }: avatar) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0});
  const [pixelCrop, setPixelCrop] = useState<Area>({ x: 0, y: 0, width: 0, height:0 });
  const [zoom, setZoom] = useState<number>(1);
  const [image, setBaseImage] = useState<string>('');
  const modal = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if(showModal && modal.current) {
      modal.current.showModal()
    }
  });

  function onFileSelected(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		const imageFile = input.files[0];
		const reader = new FileReader();
		reader.onload = (event) => {
			const result = (event.target as FileReader).result;
			setBaseImage(typeof result === 'string' ? result : '');
		};
		reader.readAsDataURL(imageFile);
	}

  async function previewCrop(_e: Area, ebis: Area) {
    // set pixelCrop to the cropper event
		setPixelCrop(ebis);
		const { x, y, width } = ebis;
		const scale = 100 / width;
		if (preview.current) {
			preview.current.style = `margin: ${-y * scale}px 0 0 ${
				-x * scale
			}px; width: ${preview.current.naturalWidth * scale}px;`;
		}
	}

  async function cropImage() {
		const cropResult = await getCroppedImg(image, pixelCrop);
    if(cropResult) {
      setImage(cropResult);
    }
    
		setShowModal(false);
		
		if (modal.current) {
			modal.current.close();
		}
	}

  function reset() {
		setBaseImage('');
    setCrop({ x: 0, y: 0});
    setPixelCrop({ x: 0, y: 0, width: 0, height:0 });
    setZoom(1);
    if(croppedImage) {
      setImage('');
    }
	}

  const askImageSelection = () => {
    const inputEl = document.querySelector('#avatarInput') as HTMLInputElement;
    inputEl.click();
  };

  return (
    <dialog
      ref={modal}
      onClose={() => setShowModal(false)}
      onClick={(e) => {
		    if (e.target === modal.current) modal.current?.close();
	    }}
    >
      <div>
        {!image &&
          <>
          <input
            id="avatarInput"
            type="file"
            accept=".jpg, .jpeg, .png, .gif"
            onChange={(e) => onFileSelected(e as unknown as Event)}
			    />
          <Button type="button" callback={askImageSelection} label="Choisir une image" />
          </>
        }
        {
          image &&
          <>
            <h2>svelte-easy-crop</h2>
            <div style={{position: 'relative', width: '100%', height: '300px'}}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                cropShape="round"
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={previewCrop}
                onZoomChange={setZoom}
              />
            </div>
            <h2>Preview</h2>
            <div className="prof-pic-wrapper">
              <img
                  ref={preview}
                  className="prof-pic"
                  src={image}
                  alt="Profile example"
                />
            </div>
            <br />
            <Button type="button" callback={async () => reset()} label="❌ Supprimer" />
			      <Button type="button" callback={async () => cropImage()} label="✅ Valider" />
          </>
        }
      </div>
      <Button
				type="button"
				callback={() => {
					if (modal.current) modal.current.close();
				}}
				label="Annuler"
			/>
    </dialog>
  )
}