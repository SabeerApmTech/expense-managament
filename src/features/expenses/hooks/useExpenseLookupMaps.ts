import { useMemo } from 'react';
import { useExpenseTypes, usePayModes, useTravelModes, useExpensePageLoad } from './useMasterData';

export const useExpenseLookupMaps = () => {
  const { data: pageLoad } = useExpensePageLoad();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const { data: payModes = [] } = usePayModes();
  const { data: travelModes = [] } = useTravelModes();

  const expTypeMap = useMemo<Record<number, string>>(() => {
    const list = pageLoad?.expenseTypes.length
      ? pageLoad.expenseTypes.map(t => ({ id: t.expenseTypeId, name: t.expenseTypeName }))
      : expenseTypes.map(t => ({ id: t.id, name: t.name }));
    return Object.fromEntries(list.map(t => [t.id, t.name]));
  }, [pageLoad, expenseTypes]);

  const payModeMap = useMemo<Record<number, string>>(() => {
    const list = pageLoad?.paymentModes.length
      ? pageLoad.paymentModes.map(p => ({ id: p.paymentModeId, name: p.paymentModeName }))
      : payModes.map(p => ({ id: p.id, name: p.name }));
    return Object.fromEntries(list.map(m => [m.id, m.name]));
  }, [pageLoad, payModes]);

  const travelModeMap = useMemo<Record<number, string>>(() => {
    const list = pageLoad?.travelModes.length
      ? pageLoad.travelModes.map(t => ({ id: t.travelModeId, name: t.travelModeName }))
      : travelModes.map(t => ({ id: t.id, name: t.name }));
    return Object.fromEntries(list.map(m => [m.id, m.name]));
  }, [pageLoad, travelModes]);

  return { expTypeMap, payModeMap, travelModeMap };
};
