export default function Tags({ tags }) {
  if (!tags?.length) return null;

  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li className="tag" key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
