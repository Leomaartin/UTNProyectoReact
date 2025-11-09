import React from "react";

function Estilo(props) {
  return <div style={props.style}></div>;
}
function Card({ style, children }) {
  return (
    <div className="card" style={style}>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default Card;
