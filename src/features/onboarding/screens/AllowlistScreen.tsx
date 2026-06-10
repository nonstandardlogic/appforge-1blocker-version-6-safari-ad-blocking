import React, {useCallback} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '../../../shared/store';
import {
  removeEntry,
  setSearchQuery,
  type AllowlistEntry,
} from '../allowlistSlice';
import AllowlistModule from '../../../native/modules/AllowlistModule';

export function AllowlistScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {entries, searchQuery} = useSelector((s: RootState) => s.allowlist);

  const filtered = entries.filter(e =>
    e.domain.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRemove = useCallback(
    async (domain: string) => {
      dispatch(removeEntry(domain));
      await AllowlistModule.removeDomain(domain);
    },
    [dispatch],
  );

  const renderItem = ({item}: {item: AllowlistEntry}) => (
    <View style={styles.row} testID={`allowlist-entry-${item.domain}`}>
      <Text style={styles.domain}>{item.domain}</Text>
      <TouchableOpacity
        onPress={() => handleRemove(item.domain)}
        testID={`remove-${item.domain}`}
        accessibilityLabel={`Remove ${item.domain} from allowlist`}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container} testID="allowlist-screen">
      <TextInput
        style={styles.searchInput}
        placeholder="Search allowed sites..."
        value={searchQuery}
        onChangeText={q => dispatch(setSearchQuery(q))}
        testID="allowlist-search-input"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {filtered.length === 0 ? (
        <View testID="allowlist-empty" style={styles.empty}>
          <Text style={styles.emptyText}>No allowed sites yet.</Text>
        </View>
      ) : (
        <FlatList
          testID="allowlist-list"
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  searchInput: {
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
  },
  domain: {fontSize: 15, color: '#000', flex: 1},
  removeText: {fontSize: 14, color: '#FF3B30', fontWeight: '600'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {fontSize: 15, color: '#8E8E93'},
});
