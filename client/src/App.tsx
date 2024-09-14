import { ImageProvider } from "../src/context/image-provider"
import ImageUploadAndPreview from "./components/image-preview";
import { ImageControls } from "./components/image-controls"
import { DownloadButton } from "./components/download-button";

export const App: React.FC = () => {
  return (
    <ImageProvider>
      <div className="min-h-screen m-5">
        <div className="flex flex-row items-center justify-center pt-3 pb-5">
          <h1 className="text-2xl font-bold text-center font-dmsans">Filter Pixel Assignment by</h1>
          <a href="https://www.linkedin.com/in/vishaalvenkatesan/" className="pl-2 text-2xl hover:underline" target="__blank">Vishaal Venkatesan</a>
        </div>
      <ImageUploadAndPreview />
      <ImageControls />
      <DownloadButton />
      </div>
    </ImageProvider>
  );
};  