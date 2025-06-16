const TextInput = ({
  label,
  placeholder,
  className,
  value,
  setValue,
  labelCLassName,
}) => {
  return (
    <div className={`textIputDiv flex flex-col space-y-2 w-full ${className}`}>
      <label htmlFor={label} className={`font-semibold ${labelCLassName}`}>
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="p-3 border border-gray-400 border-solid rounded placeholder-gray-500"
        id={label}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
    </div>
  );
};

export default TextInput;
