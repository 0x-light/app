import { ReactComponent as PoapLogo } from '../../../../assets/svg/poap-logo.svg';

import { PoapButton, PoapWrapper, InnerPoapWrapper } from './styled';
import { InputButton } from '../../../InputButton';

type POAPFieldProps = {
  onConfigure: (event: MouseEvent) => void;
  onRemove: (event: MouseEvent) => void;
};

export function PoapField({ onConfigure, onRemove }: POAPFieldProps) {
  return (
    <PoapWrapper>
      <InnerPoapWrapper>
        <PoapButton>
          <PoapLogo />
          POAPs
        </PoapButton>
        <InputButton displayInlineFlex={true} variant="sliders" marginRight="4px" onClick={onConfigure} />
        <InputButton displayInlineFlex={true} variant="trash-can" onClick={onRemove} />
      </InnerPoapWrapper>
    </PoapWrapper>
  );
}
