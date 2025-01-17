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
import { Card as CardBase, CardBody, CardTitle } from '../../../../components/Card';
import styled from 'styled-components';
import { FormGroup as FormGroupBase } from '../../../../components/form';
import { unstable_batchedUpdates } from 'react-dom';

const Card = styled(CardBase)`
  min-height: 300px;
`;

const FormGroup = styled(FormGroupBase)`
  margin-bottom: 24px;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Main = styled.div``;

const Aside = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

interface NimiConnectContainerProps {
  address: string;
}

export function NimiConnectContainer({ address }: NimiConnectContainerProps) {
  const [fetchTokenError, setFetchTokenError] = useState<Error>();
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

    unstable_batchedUpdates(() => {
      setIsFetchingToken(true);
      fetchTokenError && setFetchTokenError(undefined);
    });

    try {
      const signature = await provider.getSigner().signMessage(NIMI_CONNECT_SIGNATURE_TEXT_PAYLOAD);
      const nimiToken = await getNimiConnectAppJWT({ ensName, signature });
      const qrCodeURL = await QRCode.toDataURL(nimiToken.token, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
      });

      unstable_batchedUpdates(() => {
        setNimiToken(nimiToken);
        setTokenQRDataURI(qrCodeURL);
        setIsFetchingToken(false);
      });
    } catch (error) {
      console.error(error);
      unstable_batchedUpdates(() => {
        setFetchTokenError(new Error('Failed to fetch Nimi token'));
        setIsFetchingToken(false);
      });
    }
  }, [provider, account, ensName, fetchTokenError]);

  if (loading) {
    return <Loader />;
  }

  if (ensNames.length === 0) {
    <Container>
      <h1>You have no domains</h1>
    </Container>;
  }

  return (
    <Container>
      <Card>
        <CardBody>
          <Layout>
            <Main>
              <CardTitle>Nimi Connect</CardTitle>
              <FormGroup>
                <p>Nimi Connect is still in beta. This feature is experimental.</p>
              </FormGroup>
              <FormGroup>
                <Select
                  options={ensNames.map(({ name }) => ({
                    value: name,
                    label: name,
                  }))}
                  onChange={(option) => {
                    option?.value && setEnsName(option.value);
                  }}
                  components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,
                  }}
                  isMulti={false}
                  isSearchable={true}
                  placeholder="Select an ENS name"
                />
              </FormGroup>
              <FormGroup>
                <Button disabled={ensName === undefined} onClick={getNimiToken} title="Get Nimi App Connect">
                  Get QR Code
                </Button>
              </FormGroup>
            </Main>
            <Aside>
              {isFetchingToken ? (
                <Loader size={30} />
              ) : (
                nimiToken && (
                  <div>
                    <img src={tokenQRDataURI} alt="Nimi App Connect" />
                  </div>
                )
              )}
            </Aside>
          </Layout>
        </CardBody>
      </Card>
    </Container>
  );
}
