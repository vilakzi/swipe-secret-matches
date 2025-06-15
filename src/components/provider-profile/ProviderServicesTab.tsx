
import { Button } from '@/components/ui/button';

const ProviderServicesTab = ({ services }: { services?: string[] }) => {
  return (
    <div className="bg-black/20 backdrop-blur-md border border-gray-700 rounded shadow">
      <div className="p-6">
        <h2 className="text-white font-bold text-lg mb-3">Services Offered</h2>
        {services && services.length > 0 ? (
          <div className="grid gap-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <span className="text-white">{service}</span>
                <Button size="sm" variant="outline" className="border-purple-500 text-purple-400">
                  Inquire
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No services listed.</p>
        )}
      </div>
    </div>
  );
};

export default ProviderServicesTab;
