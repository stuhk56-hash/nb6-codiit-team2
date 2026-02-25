import axios, { AxiosError } from 'axios';

/**
 * 내 정보 조회 API 호출
 * @returns Promise<UserResponse>
 */
export const getMyInfo = async (): Promise<UserResponse> => {
  try {
    const response = await axios.get<UserResponse>('/api/users/me', {
      headers: {
        // 보통 내 정보 조회는 인증 토큰이 필요합니다.
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<UserNotFoundDto>;

    if (axiosError.response?.status === 404) {
      console.error(
        '유저 정보를 찾을 수 없습니다:',
        axiosError.response.data.message,
      );
    } else {
      console.error('API 호출 중 오류 발생:', axiosError.message);
    }

    throw error;
  }
};
