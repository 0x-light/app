import { namehash as ensNameHash } from '@ethersproject/hash';
import { Navigate, useParams } from 'react-router-dom';

import { useGetDomainFromSubgraphQuery } from '../../generated/graphql/ens';
import { CreateNimi } from '../../components/CreateNimi';
import { Loader } from '../../components/Loader';
import { Container } from '../../components/Container';
import { useWeb3React } from '@web3-react/core';
import { ActiveNetworkState, useActiveNetwork } from '../../context/ActiveNetwork';
import { useSolana } from '../../context/SolanaProvider';
import { SUPPORTED_CHAIN_IDS } from '../../constants';
export function CreateEthereumNimi() {
  const { account, chainId } = useWeb3React();
  const { ensName } = useParams();
  const nodeHash = ensNameHash(ensName as string);

  /**
   * @todo - prevent accessing if the user does not own the domain
   */
  const { data, loading, error } = useGetDomainFromSubgraphQuery({
    variables: {
      domainId: nodeHash.toLowerCase(),
    },
  });

  if (loading) {
    return <Loader />;
  }

  if (error || !data || !data.domain) {
    return <div>{error?.message}</div>;
  }

  if (!SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
    return <div>Wrong network</div>;
  }

  return (
    <Container>
      <CreateNimi
        userAddress={account as string}
        ensName={data.domain.name as string}
        ensLabelName={data.domain.labelName as string}
      />
    </Container>
  );
}
export function CreateSolanaNimi() {
  const { ensName } = useParams();
  const { publicKey, connecting } = useSolana();

  if (!ensName || !publicKey || connecting) {
    return <div>Loading</div>;
  }

  return (
    <Container>
      <CreateNimi
        //TODO: Fix form validators to support Solana addresses
        // userAddress={publicKey?.toString()}
        userAddress={publicKey?.toString()}
        ensName={ensName}
        ensLabelName={ensName}
      />
    </Container>
  );
}

export function CreateNimiPage() {
  const { activeNetwork } = useActiveNetwork();
  const { publicKey, connecting } = useSolana();
  if (activeNetwork === ActiveNetworkState.ETHEREUM) return <CreateEthereumNimi />;
  else if (activeNetwork === ActiveNetworkState.SOLANA && (connecting || publicKey)) return <CreateSolanaNimi />;

  return <Navigate to="/" />;
}
