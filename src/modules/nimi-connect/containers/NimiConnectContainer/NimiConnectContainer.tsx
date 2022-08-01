import { useWeb3React } from '@web3-react/core';
import { useState, useCallback } from 'react';
import Select from 'react-select';
import * as QRCode from 'qrcode';

import { useGetDomainsQuery } from '../../../../generated/graphql/ens';
import { Container } from '../../../../components/Container';
import { Loader } from '../../../../components/Loader';
import { Button } from '../../../../components/Button';
import { CreateNimiConnectSessionResponse, getNimiConnectAppJWT } from '../../api';
import { NIMI_CONNECT_SIGNATURE_TEXT_PAYLOAD } from '../../constants';

interface NimiConnectContainerProps {
  address: string;
}

export function NimiConnectContainer({ address }: NimiConnectContainerProps) {
  // Contain the Token QR
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const { account, provider } = useWeb3React();
  const [tokenQRDataURI, setTokenQRDataURI] = useState('');
  const [nimiToken, setNimiToken] = useState<CreateNimiConnectSessionResponse>();
  const [ensName, setEnsName] = useState<string>();
  const { data, loading } = useGetDomainsQuery({
    variables: {
      address: address.toLowerCase(),
    },
  });
  const ensNames = data?.account?.domains || [];

  const getNimiToken = useCallback(async () => {
    if (!account || !provider) {
      alert('No provider found. Please, connect to MetaMask');
      return;
    }

    if (!ensName) {
      alert('Please, enter ENS name');
      return;
    }

    setIsFetchingToken(true);

    const signature = await provider.getSigner().signMessage(NIMI_CONNECT_SIGNATURE_TEXT_PAYLOAD);

    getNimiConnectAppJWT({
      signature,
      ensName,
    })
      .then(async ({ expiresAt, token, type }) => {
        setNimiToken({
          expiresAt,
          token,
          type,
        });

        const qrCodeURL = await QRCode.toDataURL(token, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
        });

        setTokenQRDataURI(qrCodeURL);
      })
      .catch(() => {
        alert('Something went wrong. Please, try again later');
      })
      .finally(() => {
        setIsFetchingToken(false);
      });
  }, [provider, account, ensName]);

  if (loading || isFetchingToken) {
    return <Loader />;
  }

  if (ensNames.length === 0) {
    <Container>
      <h1>You have no domains</h1>
    </Container>;
  }

  return (
    <Container>
      <h1>NimiConnect</h1>
      <Select
        options={ensNames.map(({ name }) => ({
          value: name,
          label: name,
        }))}
        onChange={(option) => {
          option?.value && setEnsName(option.value);
        }}
        isMulti={false}
        isSearchable={true}
        placeholder="Enter ENS name"
      />
      <Button onClick={getNimiToken} title="Get Nimi App Connect">
        Connect
      </Button>
      {nimiToken && (
        <div>
          <h2>Nimi App Connect</h2>
          <img src={tokenQRDataURI} alt="Nimi App Connect" />
        </div>
      )}
    </Container>
  );
}
