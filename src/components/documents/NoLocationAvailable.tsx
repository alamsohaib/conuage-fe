
interface NoLocationAvailableProps {
  isLoading: boolean;
}

const NoLocationAvailable = ({ isLoading }: NoLocationAvailableProps) => {
  return (
    <div className="md:col-span-12 lg:col-span-12 bg-muted/40 rounded-lg p-8 text-center">
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium mb-2">No locations available</h3>
          <p className="text-muted-foreground mb-4">
            Please contact your administrator to add locations to your account.
          </p>
        </>
      )}
    </div>
  );
};

export default NoLocationAvailable;
