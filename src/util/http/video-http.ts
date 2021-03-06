import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { VideoFileFieldsMap } from '../models';
import HttpResource from './http-resource';
import { httpVideo } from './index';

class VideoHttp extends HttpResource {
  create<T = any>(data): Promise<AxiosResponse<T>> {
    return this.http.post<T>(this.resource, this.sanitizeData(data, 'POST'));
  }

  update<T = any>(id, data, options?: { config?: AxiosRequestConfig }): Promise<AxiosResponse<T>> {
    return this.http.post<T>(
      `${this.resource}/${id}`,
      this.sanitizeData(data, 'PUT'),
      options?.config,
    );
  }

  partialUpdate<T = any>(
    id,
    data,
    options?: { config?: AxiosRequestConfig },
  ): Promise<AxiosResponse<T>> {
    return this.http.post<T>(
      `${this.resource}/${id}`,
      this.sanitizeData(data, 'PATCH'),
      options?.config,
    );
  }

  private sanitizeData(data, methodSpoofing: string) {
    const formData = new FormData();

    formData.append('_method', methodSpoofing);
    data.title && formData.append('title', data.title);
    data.description && formData.append('description', data.description);
    data.year_launched && formData.append('year_launched', data.year_launched);
    data.duration && formData.append('duration', data.duration);
    data.rating && formData.append('rating', data.rating);
    data.opened && formData.append('opened', data.opened);

    data.cast_members?.forEach((item) => formData.append('cast_members_id[]', item.id));
    data.genres?.forEach((item) => formData.append('genres_id[]', item.id));
    data.categories?.forEach((item) => formData.append('categories_id[]', item.id));

    Object.keys(VideoFileFieldsMap).forEach((field) => {
      if (data[field] instanceof File) {
        formData.append(field, data[field]);
      }
    });

    return formData;
  }
}

export default new VideoHttp(httpVideo, 'videos');
