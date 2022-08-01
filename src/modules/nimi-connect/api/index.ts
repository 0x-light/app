import axios from 'axios';
import { getAPIBaseURL } from '../../api-service';

export interface GetNimiConnectAppJWTParams {
  signature: string;
  ensName: string;
}

export interface CreateNimiConnectSessionResponse {
  token: string;
  expiresAt: string;
  type: 'Bearer';
}

export function getNimiConnectAppJWT({ signature, ensName }: GetNimiConnectAppJWTParams) {
  const url = `${getAPIBaseURL()}/nimi/connect/token`;

  return axios
    .post<{
      data: CreateNimiConnectSessionResponse;
    }>(url, {
      signature,
      ensName,
    })
    .then(({ data }) => data.data);
}
