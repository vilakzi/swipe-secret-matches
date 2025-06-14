
interface PostCardCaptionProps {
  name: string;
  caption?: string;
  onProfileClick: () => void;
}

const PostCardCaption = ({
  name,
  caption,
  onProfileClick,
}: PostCardCaptionProps) => {
  if (!caption) return null;
  return (
    <div className="text-white">
      <span
        className="font-semibold cursor-pointer hover:text-purple-400 transition-colors"
        onClick={onProfileClick}
      >
        {name}
      </span>
      <span className="ml-2 text-gray-300">{caption}</span>
    </div>
  );
};

export default PostCardCaption;
