/* IMPORTS */
// Config
import React from "react";
// Components
import "./style.css";

export default ({ title, description, link, handleChanges }) => {
  return (
    <>
        <div className="section">
            <label className="sectionLabel">Title</label>
            <input
                className="input"
                type="text"
                name="title"
                value={title}
                onChange={handleChanges}
            />
        </div>
        <div className="section">
            <label className="sectionLabel">Description</label>
            <textarea
                className="input"
                type="text textarea"
                name="description"
                value={description}
                onChange={handleChanges}
            />
        </div>
        <div className="section">
            <label className="sectionLabel">Link</label>
            <input
                className="input"
                type="text"
                name="link"
                value={link}
                onChange={handleChanges}
            />
        </div>
    </>
  )
}