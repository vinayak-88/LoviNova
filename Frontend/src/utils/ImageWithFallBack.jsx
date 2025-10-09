import { useEffect,useState } from "react";

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const fallbackSrc = process.env.IMAGE_FALLBACK;

  // Reset image source when src prop changes
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
};

export default ImageWithFallback