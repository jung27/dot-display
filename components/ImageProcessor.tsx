import { useRef, useState } from "react";

export default function ImageUpload() {
  const [imageSrc, setImageSrc] = useState("");
  const [pixelScale, setPixelScale] = useState(0.1);
  const [offset, setOffset] = useState([0, 0, 0] as [number, number, number]);
  const fileRef = useRef<HTMLInputElement>(null);

  //이미지 랜더링해서 base64로 변환하는 함수
  const encodeFileToBase64 = async (fileBlob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileBlob);
    try {
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            setImageSrc(result);
          }
          resolve();
        };
      });
    } catch (error) {
      console.error(error);
    }
  };

  //이미지 파일이 변경되었을 때 실행되는 함수
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (files && files[0]) {
      encodeFileToBase64(files[0]);
    }
  };

  const onClickInput = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const downloadMcfunction = async () => {
    const element = document.createElement("a");
    const commands = await getCommands();
    const file = new Blob([commands.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${
      fileRef.current?.files && fileRef.current?.files[0].name.split(".")[0]
    }.mcfunction`;
    document.body.appendChild(element);
    element.click();
  };

  //이미지 클릭시 실행되는 함수
  const handleImageClick = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    setImageSrc("");
  };

  //rgba to int
  const rgbaToInt = (r: number, g: number, b: number, a: number) => {
    return (
      ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff) | ((a & 0xff) << 24)
    );
  };

  //이미지가 변경되었을 때 실행되는 함수
  const getCommands = () => {
    return new Promise<string[]>((resolve) => {
      const commands: string[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      img.onload = function () {
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        for (let i = 0; i < img.width; i += 1) {
          for (let j = 0; j < img.height; j += 1) {
            const pixelData = ctx.getImageData(j, i, 1, 1).data;

            if (pixelData[3] === 0) continue;
            const command = `summon text_display ~ ~ ~ {text_opacity:10,transformation:{left_rotation:[-0.7f,0f,0f,0.7f],right_rotation:[0f,0f,0f,1f],translation:[${
              j * pixelScale + offset[0] + 0.046
            }f,${offset[1]}f,${i * pixelScale + offset[2] + 0.097}f],scale:[${
              pixelScale / 0.269
            }f,${pixelScale / 0.269}f,${
              pixelScale / 0.269
            }f]},text:'{"text":"|||||"}',background:${rgbaToInt(
              pixelData[0],
              pixelData[1],
              pixelData[2],
              pixelData[3]
            )}}`;
            commands.push(command);
          }
        }
        resolve(commands);
      };
    });
  };

  return (
    <div>
      <div className="float-left">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
        />
        {imageSrc === "" ? (
          <div
            onClick={onClickInput}
            className="w-96 h-60 m-20 rounded-2xl cursor-pointer border-4 border-white text-white text-center text-7xl py-14"
          >
            +
          </div>
        ) : (
          <div>
            <img
              src={imageSrc}
              alt="Uploaded image"
              className="w-96 m-20 rounded-2xl cursor-pointer disable-blur"
              onClick={handleImageClick}
            />
            <button
              onClick={downloadMcfunction}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold ml-52 py-2 px-4 border border-gray-400 rounded shadow"
            >
              mcfunction 파일 다운로드
            </button>
          </div>
        )}
      </div>
      <div className="float-left ml-32 p-10">
        <h1 className="text-3xl mt-10 text-white font-bold">Modifier</h1>
        <div>
          <div className="text-white text-xl mt-10">오프셋</div>
          <input
            placeholder="x"
            type="number"
            value={offset[0]}
            onChange={(event) =>
              setOffset([+event.target.value, offset[1], offset[2]])
            }
            className="mt-2 w-32 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <input
            placeholder="y"
            type="number"
            value={offset[1]}
            onChange={(event) =>
              setOffset([offset[0], +event.target.value, offset[2]])
            }
            className="float- ml-2 mt-2 w-32 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <input
            placeholder="z"
            type="number"
            value={offset[2]}
            onChange={(event) =>
              setOffset([offset[0], offset[1], +event.target.value])
            }
            className="float- ml-2 mt-2 w-32 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <div className="text-white text-xl mt-10">픽셀 크기</div>
          <input
            type="number"
            value={pixelScale}
            onChange={(event) => setPixelScale(+event.target.value)}
            className="mt-2 w-32 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
