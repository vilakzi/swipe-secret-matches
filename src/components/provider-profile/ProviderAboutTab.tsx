import { ProviderData } from '@/types/provider';

const ProviderAboutTab = ({ provider }: { provider: ProviderData }) => (
  <div className="bg-black/20 backdrop-blur-md border border-gray-700 rounded shadow">
    <div className="p-6">
      <h2 className="text-white font-bold text-lg mb-3">About</h2>
      <p className="text-gray-300 mb-4">{provider.bio || 'No bio available.'}</p>
      {provider.profile_images && provider.profile_images.length > 1 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Photos</h3>
          <div className="grid grid-cols-3 gap-3">
            {provider.profile_images.slice(1).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${provider.display_name} ${index + 2}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ProviderAboutTab;
