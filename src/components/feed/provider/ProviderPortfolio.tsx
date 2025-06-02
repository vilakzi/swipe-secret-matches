
interface ProviderPortfolioProps {
  portfolio: string[];
  onImageClick: () => void;
}

const ProviderPortfolio = ({ portfolio, onImageClick }: ProviderPortfolioProps) => {
  return (
    <div className="p-4 border-t border-gray-700">
      <h4 className="text-white font-semibold mb-2">Portfolio</h4>
      <div className="grid grid-cols-3 gap-2">
        {portfolio.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Portfolio ${index + 1}`}
            className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
            onClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ProviderPortfolio;
