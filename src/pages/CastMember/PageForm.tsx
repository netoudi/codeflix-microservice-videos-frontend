import * as React from 'react';
import { useParams } from 'react-router';
import { Page } from '../../components/Page';
import Form from './Form';

const PageForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <Page title={!id ? 'Criar membro de elenco' : 'Editar membro de elenco'}>
      <Form />
    </Page>
  );
};

export default PageForm;
