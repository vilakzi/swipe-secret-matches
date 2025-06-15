
import ImageModal from '@/components/ui/ImageModal';
import { useImageModal } from '@/hooks/useImageModal';

interface ProviderPortfolioProps {
  portfolio: string[];
  onImageClick: () => void;
}

const ProviderPortfolio = ({ portfolio, onImageClick }: ProviderPortfolioProps) => {
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();

  const handlePortfolioImageClick = (imageUrl: string, index: number) => {
    openModal(imageUrl, `Portfolio image ${index + 1}`);
  };

  return (
    <>
      <div className="p-4 border-t border-gray-700">
        <h4 className="text-white font-semibold mb-2">Portfolio</h4>
        <div className="grid grid-cols-3 gap-2">
          {portfolio.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Portfolio ${index + 1}`}
              className="w-full aspect-square max-h-28 object-cover object-center rounded cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
              onClick={() => handlePortfolioImageClick(image, index)}
              style={{ aspectRatio: '1/1' }}
            />
          ))}
        </div>
      </div>

      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </>
  );
};

export default ProviderPortfolio;
