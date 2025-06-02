
import { Badge } from '@/components/ui/badge';

interface ProviderServicesProps {
  serviceCategory?: string;
  services?: string[];
}

const ProviderServices = ({ serviceCategory, services }: ProviderServicesProps) => {
  return (
    <>
      {/* Service Category */}
      {serviceCategory && (
        <div className="px-4 pb-2">
          <Badge className="bg-blue-600 text-white">
            {serviceCategory}
          </Badge>
        </div>
      )}

      {/* Services */}
      {services && services.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                {service}
              </Badge>
            ))}
            {services.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                +{services.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderServices;
