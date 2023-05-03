import { useRef, useState } from "react";

interface HomeProps {
  // Define any props here
}

const Home = (props: HomeProps) => {
  const [imageSrc, setImageSrc] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  //rgba to int
  const rgbaToInt = (r: number, g: number, b: number, a: number) => {
    return (
      ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff) | ((a & 0xff) << 24)
    );
  };

  //이미지 파일이 변경되었을 때 실행되는 함수
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (files && files[0]) {
      encodeFileToBase64(files[0]);
    }
  };

  //이미지 클릭시 실행되는 함수
  const handleImageClick = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    setImageSrc("");
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
            const command = `summon text_display ~ ~ ~ {text_opacity:10,transformation:{left_rotation:[-0.7f,0f,0f,0.7f],right_rotation:[0f,0f,0f,1f],translation:[${j * 0.269}f,0f,${
              i * 0.269
            }f],scale:[1f,1f,1f]},text:'{"text":"|||||"}',background:${rgbaToInt(
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
      <h1 className="text-center text-5xl mt-10 text-white font-bold">
        Dot Display
      </h1>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
      />
      {imageSrc === "" ? (
        <div
          onClick={onClickInput}
          className="w-1/4 h-60 m-20 rounded-2xl cursor-pointer border-4 border-white text-white text-center text-7xl py-14"
        >
          +
        </div>
      ) : (
        <div>
          <img
            src={imageSrc}
            alt="Uploaded image"
            className="w-1/4 m-20 rounded-2xl cursor-pointer disable-blur"
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
  );
};

export default Home;
