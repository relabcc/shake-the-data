import React from 'react'

const DataLabel = ({ x, y, children = '' }) => {
    const lines = children.split('\n')
  return (
    <div
        style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        }}
        className="label-box"
    >
        {lines.map((l, i) => <p key={i}>{l}</p>)}
    </div>
  )
}

export default DataLabel