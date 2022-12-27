module.exports = {
  handleDuplicate: (error) => {
    const value = error.keyValue.name

    const message = `Duplicate field value: ${value}.Please use another value!`

    return message
  }
}
