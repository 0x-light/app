import Select from 'react-select';
import * as QRCode from 'qrcode';
import { useGetDomainsQuery } from '../../../../generated/graphql/ens';
import { Loader } from '../../../../components/Loader';
import { Container } from '../../../../components/Container';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useState } from 'react';
import { Button } from '../../../../components/Button';
import { useWalletSwitcherPopoverToggle } from '../../../../state/application/hooks';
import { NimiConnectContainer } from '../../containers/NimiConnectContainer';

/**
 * An experimental page for NimiConnect
 */
export function NimiConnect() {
  const { isActive, account } = useWeb3React();
  const openWalletSwitcherPopover = useWalletSwitcherPopoverToggle();

  const onCTAClick = () => openWalletSwitcherPopover();

  if (account && isActive) {
    return <NimiConnectContainer address={account} />;
  }

  // Redirect to home page if no wallet is connected
  return (
    <Container>
      <Button onClick={onCTAClick}>
        <span>Connect Wallet</span>
      </Button>
    </Container>
  );
}
