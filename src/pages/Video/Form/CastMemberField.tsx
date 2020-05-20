import * as React from 'react';
import { MutableRefObject, useImperativeHandle, useRef } from 'react';
import { FormControl, FormControlProps, FormHelperText, Typography } from '@material-ui/core';
import AsyncAutocomplete, {
  AsyncAutocompleteComponent,
} from '../../../components/AsyncAutocomplete';
import GridSelected from '../../../components/GridSelected';
import GridSelectedItem from '../../../components/GridSelected/GridSelectedItem';
import useHttpHandled from '../../../hooks/useHttpHandled';
import castMemberHttp from '../../../util/http/cast-member-http';
import useCollectionManager from '../../../hooks/useCollectionManager';

interface CastMemberFieldProps {
  castMembers: any[];
  setCastMembers: (castMembers) => void;
  error: any;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

export interface CastMemberFieldComponent {
  clear: () => void;
}

const CastMemberField: React.RefForwardingComponent<
  CastMemberFieldComponent,
  CastMemberFieldProps
> = (props, ref) => {
  const { castMembers, setCastMembers, error, disabled } = props;
  const autocompleteHttp = useHttpHandled();
  const { addItem, removeItem } = useCollectionManager(castMembers, setCastMembers);
  const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;

  function fetchOptions(searchText) {
    return autocompleteHttp(
      castMemberHttp.list({ queryParams: { search: searchText, all: '' } }),
    ).then((response) => response.data.data);
  }

  useImperativeHandle(ref, () => ({
    clear: () => autocompleteRef.current.clear(),
  }));

  return (
    <>
      <AsyncAutocomplete
        ref={autocompleteRef}
        fetchOptions={fetchOptions}
        AutocompleteProps={{
          clearOnEscape: true,
          freeSolo: true,
          getOptionLabel: (option) => option.name,
          getOptionSelected: (option, value) => option.id === value.id,
          onChange: (event, value) => addItem(value),
          disabled: disabled === true,
        }}
        TextFieldProps={{ label: 'Elenco', error: error !== undefined }}
      />
      <FormControl
        fullWidth
        margin="none"
        error={error !== undefined}
        disabled={disabled === true}
        {...props.FormControlProps}
      >
        {!!castMembers.length && (
          <GridSelected>
            {castMembers.map((castMember) => (
              <GridSelectedItem
                key={String(castMember.id)}
                onDelete={() => removeItem(castMember)}
                xs={6}
              >
                <Typography noWrap>{castMember.name}</Typography>
              </GridSelectedItem>
            ))}
          </GridSelected>
        )}
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    </>
  );
};

export default React.forwardRef(CastMemberField);
