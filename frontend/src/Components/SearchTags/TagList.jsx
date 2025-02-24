// TagList.js
import React, { useState } from "react";

const TagList = ({ tags }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="tag-list">
      {tags.map((tag, index) => (
        <button
          key={index}
          className={selectedTags.includes(tag) ? "selected" : ""}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagList;
