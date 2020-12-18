/* IMPORTS */
// Config
import React from "react";
// Components
import "./style.css";

export default ({ title, description, link, handleChanges }) => {
  return (
    <>
        <div className="section">
            <label className="sectionLabel">
                Title
                {title.hasChanged && !title.value
                  ? <span className="invalidAddress"> *</span>
                  : null}
            </label>
            <input
                className="input"
                type="text"
                name="title"
                value={title.value}
                onChange={handleChanges}
            />
        </div>
        <div className="section">
            <label className="sectionLabel">
                Description
                {description.hasChanged && !description.value
                  ? <span className="invalidAddress"> *</span>
                  : null}
            </label>
            <textarea
                className="input"
                type="text textarea"
                name="description"
                value={description.value}
                onChange={handleChanges}
            />
        </div>
        <div className="section">
            <label className="sectionLabel">
                Link
                {link.hasChanged && !link.value
                  ? <span className="invalidAddress"> *</span>
                  : null}
            </label>
            <input
                className="input"
                type="text"
                name="link"
                value={link.value}
                onChange={handleChanges}
            />
        </div>
    </>
  )
}