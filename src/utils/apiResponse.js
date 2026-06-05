class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  success(data, message = 'Success', statusCode = 200) {
    return this.res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  error(message = 'Server Error', statusCode = 500) {
    return this.res.status(statusCode).json({
      success: false,
      message
    });
  }
}

export default ApiResponse;
